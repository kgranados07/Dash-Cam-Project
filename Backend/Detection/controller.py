import json
import os
import queue
import threading

from record import record_segments
from analyze import analyze_video
from events import create_event, post_event, Event
from tickets import Ticket, post_ticket


OUTPUT_DIR = "recordings"
RESULTS_FILE = "results.json"
SEGMENT_SECONDS = 30
FPS = 30
SPEED_MARKER_DISTANCE_FEET = 3.0
PARKING_VIOLATION_SECONDS = 30.0
STOP_SIGN_MINIMUM_SECONDS = 10.0

TICKET_RULES = {
    "speed": ("Speeding (School Zone)", 230.00),
    "speeding": ("Speeding (School Zone)", 230.00),
    "parking": ("Parking Violation", 100.00),
    "parkingviolation": ("Parking Violation", 100.00),
    "stop": ("Stop Sign Violation", 100.00),
    "stopsign": ("Stop Sign Violation", 100.00),
    "stopsignviolation": ("Stop Sign Violation", 100.00),
}


def submit_violation_ticket(violation, event, price, user_id=None):
    """Upload a ticket for a violation already confirmed by detection logic."""
    if not isinstance(event, Event):
        raise TypeError("event must be an Event")
    ticket = Ticket(
        violation=violation,
        street_location=event.street_location,
        price=price,
        user_id=event.user_id if user_id is None else user_id,
        inrealtime=event.inrealtime,
    )
    return post_ticket(ticket)


class DwellViolationTracker:
    """Track confirmed zone dwell time from repeated QR detections."""

    def __init__(self, segment_seconds=SEGMENT_SECONDS):
        self.segment_seconds = segment_seconds
        self.segment_offsets = {}
        self.active = {}

    def process(self, detection, event):
        normalized = "".join(
            character for character in event.event_type.lower()
            if character.isalnum()
        )

        if normalized not in ("parking", "parkingviolation", "stop", "stopsign", "stopsignviolation"):
            return None

        video = detection.get("video") or "unknown"
        if video not in self.segment_offsets:
            self.segment_offsets[video] = len(self.segment_offsets) * self.segment_seconds

        local_timestamp = float(detection.get("timestamp_seconds") or 0)
        absolute_timestamp = self.segment_offsets[video] + local_timestamp
        key = (normalized, event.street_location)
        state = self.active.get(key)

        if state is None:
            state = {
                "started": absolute_timestamp,
                "last": absolute_timestamp,
                "ticket_sent": False,
            }
            self.active[key] = state
        else:
            gap = absolute_timestamp - state["last"]
            if gap > 2.0:
                state = {
                    "started": absolute_timestamp,
                    "last": absolute_timestamp,
                    "ticket_sent": False,
                }
                self.active[key] = state

        state["last"] = absolute_timestamp
        dwell_seconds = state["last"] - state["started"]

        if normalized in ("parking", "parkingviolation"):
            violation = "Parking Violation"
            price = TICKET_RULES["parking"][1]
            threshold = PARKING_VIOLATION_SECONDS
        else:
            violation = "Stop Sign Violation"
            price = TICKET_RULES["stop"][1]
            threshold = STOP_SIGN_MINIMUM_SECONDS

        if dwell_seconds >= threshold and not state["ticket_sent"]:
            state["ticket_sent"] = True
            return submit_violation_ticket(violation, event, price)

        return None


def submit_ticket_from_event(event):
    """Create a ticket for recognized event types without immediate dwell violations."""
    if not isinstance(event, Event):
        raise TypeError("event must be an Event")

    normalized = "".join(
        character for character in event.event_type.lower()
        if character.isalnum()
    )
    rule = TICKET_RULES.get(normalized)

    if rule is None:
        print(f"No ticket rule configured for event type: {event.event_type}", flush=True)
        return None

    violation, price = rule

    if normalized in ("speed", "speeding"):
        print(
            "Speed ticket requires a measured time between markers; "
            "see SPEED_MARKER_DISTANCE_FEET.",
            flush=True,
        )
        return None

    if normalized in ("parking", "parkingviolation"):
        print(
            "Parking ticket requires dwell tracking; "
            f"threshold is {PARKING_VIOLATION_SECONDS:.0f} seconds.",
            flush=True,
        )
        return None

    print(
        "Stop-sign ticket requires dwell tracking; "
        f"threshold is {STOP_SIGN_MINIMUM_SECONDS:.0f} seconds.",
        flush=True,
    )
    return None


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
    dwell_tracker = DwellViolationTracker(segment_seconds=SEGMENT_SECONDS)

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
                    detections = analyze_video(
                        item, seen_codes, RESULTS_FILE,
                        deduplicate=False
                    )
                for detection in detections:
                    try:
                        event = create_event(detection)
                        result = post_event(event)
                        print(f"Event sent to server: {result}", flush=True)

                        ticket = dwell_tracker.process(detection, event)
                        if ticket is not None:
                            print(f"Ticket sent to server: {ticket}", flush=True)
                    except (ValueError, RuntimeError) as exc:
                        print(f"Event or ticket upload failed for {item}: {exc}", flush=True)
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
                        detections = analyze_video(
                            item, seen_codes, RESULTS_FILE,
                            deduplicate=False
                        )
                    for detection in detections:
                        try:
                            event = create_event(detection)
                            result = post_event(event)
                            print(f"Event sent to server: {result}", flush=True)

                            ticket = dwell_tracker.process(detection, event)
                            if ticket is not None:
                                print(f"Ticket sent to server: {ticket}", flush=True)
                        except (ValueError, RuntimeError) as exc:
                            print(f"Event or ticket upload failed for {item}: {exc}", flush=True)
                except Exception as exc:
                    print(f"Analyzer error for {item}: {exc}", flush=True)

        print(f"Stopped. Results are saved in {RESULTS_FILE}.", flush=True)


if __name__ == "__main__":
    main()
