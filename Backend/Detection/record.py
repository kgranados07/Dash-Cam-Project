import cv2
import os
import time
import queue
import threading
from datetime import datetime


CAMERA = int(os.getenv("CAMERA_DEVICE", "0"))
WIDTH = 1280
HEIGHT = 720
FPS = 60
SEGMENT_SECONDS = 30
OUTPUT_DIR = "recordings"


def record_segments(completed_queue, stop_event, output_dir=OUTPUT_DIR,
                    segment_seconds=SEGMENT_SECONDS, camera=CAMERA,
                    width=WIDTH, height=HEIGHT, fps=FPS):
    """
    Record continuously into fixed-length video segments.
    A completed filename is placed on completed_queue only after the writer
    has been closed, so the analyzer never reads a file still being written.
    This function intentionally creates no GUI windows.
    """
    os.makedirs(output_dir, exist_ok=True)

    # Prefer an explicitly configured device. Otherwise scan common Linux
    # V4L2 indexes because the index may change after reboot or hot-plugging.
    cap = cv2.VideoCapture(camera, cv2.CAP_V4L2)
    if not cap.isOpened() and os.getenv("CAMERA_DEVICE") is None:
        cap.release()
        for candidate in range(16):
            if candidate == camera:
                continue
            candidate_cap = cv2.VideoCapture(candidate, cv2.CAP_V4L2)
            if candidate_cap.isOpened():
                ok, _ = candidate_cap.read()
                if ok:
                    cap = candidate_cap
                    camera = candidate
                    break
            candidate_cap.release()

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    cap.set(cv2.CAP_PROP_FPS, fps)

    if not cap.isOpened():
        raise RuntimeError(f"Could not open camera {camera}")

    reported_fps = cap.get(cv2.CAP_PROP_FPS)

    # Measure frames actually delivered by the camera instead of trusting V4L2 metadata.
    warmup_start = time.monotonic()
    warmup_frames = 0
    warmup_size = None
    for _ in range(fps):
        ok, frame = cap.read()
        if not ok:
            break
        warmup_frames += 1
        warmup_size = (frame.shape[1], frame.shape[0])
    warmup_elapsed = time.monotonic() - warmup_start

    measured_fps = warmup_frames / warmup_elapsed if warmup_elapsed > 0 else 0
    encoding_fps = measured_fps if measured_fps >= 1 else reported_fps
    encoding_fps = encoding_fps if encoding_fps and encoding_fps >= 1 else fps

    print(
        f"Camera timing: delivered {warmup_frames} frames in "
        f"{warmup_elapsed:.3f}s ({encoding_fps:.2f} FPS)",
        flush=True,
    )

    writer = None
    segment_start = None
    current_path = None
    frame_size = (width, height)

    def start_segment(actual_size):
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        path = os.path.join(output_dir, f"driving_{stamp}.mp4")
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        video_writer = cv2.VideoWriter(path, fourcc, encoding_fps, actual_size)
        if not video_writer.isOpened():
            video_writer.release()
            raise RuntimeError(f"Could not create video file: {path}")
        print(f"Recording: {path}", flush=True)
        return video_writer, path

    try:
        while not stop_event.is_set():
            ok, frame = cap.read()
            if not ok:
                print("Camera frame read failed; retrying.", flush=True)
                time.sleep(0.1)
                continue

            now = time.monotonic()
            actual_size = (frame.shape[1], frame.shape[0])

            if writer is None:
                writer, current_path = start_segment(actual_size)
                segment_start = now
                frame_size = actual_size

            # If the camera changes resolution, resize to the active writer's size.
            if actual_size != frame_size:
                frame = cv2.resize(frame, frame_size)

            writer.write(frame)

            if now - segment_start >= segment_seconds:
                writer.release()
                writer = None
                completed_queue.put(current_path)
                print(f"Segment ready: {current_path}", flush=True)
                current_path = None
                segment_start = None

    finally:
        if writer is not None:
            writer.release()
            # Queue the final partial segment on shutdown if it contains frames.
            if current_path and os.path.exists(current_path) and os.path.getsize(current_path) > 0:
                completed_queue.put(current_path)
                print(f"Final segment ready: {current_path}", flush=True)
        cap.release()
