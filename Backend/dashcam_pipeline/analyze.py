import cv2
import json
import os
import sys
from datetime import timedelta


def analyze_video(video_file, seen_codes=None, results_file="qr_results.json"):
    """
    Analyze a completed video without displaying any windows.
    Each QR payload is recorded only once for the entire controller session
    when the same seen_codes set is passed for each segment.
    """
    if seen_codes is None:
        seen_codes = set()

    cap = cv2.VideoCapture(video_file)
    if not cap.isOpened():
        print(f"Could not open video: {video_file}", flush=True)
        return []

    qr = cv2.QRCodeDetector()
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30.0

    frame_number = 0
    new_detections = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_number += 1
            timestamp = frame_number / fps

            data, points, _ = qr.detectAndDecode(frame)
            if data:
                # Deduplicate by QR payload across all processed segments.
                if data not in seen_codes:
                    seen_codes.add(data)
                    detection = {
                        "qr_data": data,
                        "video": os.path.basename(video_file),
                        "frame": frame_number,
                        "timestamp_seconds": round(timestamp, 3),
                        "timestamp": str(timedelta(seconds=timestamp))
                    }
                    new_detections.append(detection)
                    print(
                        f"QR CODE DETECTED: {data} | "
                        f"{os.path.basename(video_file)} | "
                        f"frame {frame_number} | {timestamp:.2f}s",
                        flush=True
                    )
    finally:
        cap.release()

    # Append new results instead of overwriting previous segments' results.
    existing = []
    if os.path.exists(results_file):
        try:
            with open(results_file, "r", encoding="utf-8") as f:
                existing = json.load(f)
            if not isinstance(existing, list):
                existing = []
        except (json.JSONDecodeError, OSError):
            existing = []

    if new_detections:
        existing.extend(new_detections)
        temp_file = results_file + ".tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=4, ensure_ascii=False)
        os.replace(temp_file, results_file)

    print(
        f"Analysis complete: {os.path.basename(video_file)} "
        f"({len(new_detections)} new unique QR code(s)).",
        flush=True
    )
    return new_detections


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze.py video.mp4 [results.json]")
        raise SystemExit(2)
    output = sys.argv[2] if len(sys.argv) > 2 else "qr_results.json"
    analyze_video(sys.argv[1], results_file=output)
