import json
import os
import queue
import threading

from record import record_segments
from analyze import analyze_video


OUTPUT_DIR = "recordings"
RESULTS_FILE = "qr_results.json"
SEGMENT_SECONDS = 30


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    completed_queue = queue.Queue()
    stop_event = threading.Event()

    # Seed deduplication from existing results so codes are not logged again
    # after restarting the controller.
    seen_codes = set()
    if os.path.exists(RESULTS_FILE):
        try:
            with open(RESULTS_FILE, "r", encoding="utf-8") as f:
                old_results = json.load(f)
            if isinstance(old_results, list):
                seen_codes.update(
                    item["qr_data"] for item in old_results
                    if isinstance(item, dict) and isinstance(item.get("qr_data"), str)
                )
        except (json.JSONDecodeError, OSError):
            print(f"Warning: could not read existing {RESULTS_FILE}; starting with an empty QR history.")
    seen_lock = threading.Lock()
    errors = queue.Queue()

    def recording_worker():
        try:
            record_segments(
                completed_queue,
                stop_event,
                output_dir=OUTPUT_DIR,
                segment_seconds=SEGMENT_SECONDS
            )
        except Exception as exc:
            errors.put(("recorder", exc))
            stop_event.set()
        finally:
            completed_queue.put(None)  # signal end of recording

    recorder = threading.Thread(target=recording_worker, name="recorder", daemon=True)
    recorder.start()

    print("Dashcam pipeline running in the background (no video windows).")
    print("Press Ctrl+C in this terminal to stop.")

    try:
        while True:
            try:
                item = completed_queue.get(timeout=0.5)
            except queue.Empty:
                if not recorder.is_alive():
                    break
                while not errors.empty():
                    source, exc = errors.get()
                    print(f"{source} error: {exc}", flush=True)
                continue

            if item is None:
                break

            try:
                # Only the analyzer thread processes videos; recording continues
                # independently while this call runs.
                with seen_lock:
                    analyze_video(item, seen_codes, RESULTS_FILE)
            except Exception as exc:
                print(f"Analyzer error for {item}: {exc}", flush=True)

    except KeyboardInterrupt:
        print("\nStopping after the current camera read...", flush=True)
        stop_event.set()
    finally:
        stop_event.set()
        recorder.join(timeout=5)
        # Process any final segment(s) queued during shutdown.
        while True:
            try:
                item = completed_queue.get_nowait()
            except queue.Empty:
                break
            if item is not None:
                try:
                    with seen_lock:
                        analyze_video(item, seen_codes, RESULTS_FILE)
                except Exception as exc:
                    print(f"Analyzer error for {item}: {exc}", flush=True)

        print(f"Stopped. Results are saved in {RESULTS_FILE}.", flush=True)


if __name__ == "__main__":
    main()
