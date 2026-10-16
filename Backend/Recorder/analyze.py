import cv2
import sys
import json
import time
from datetime import timedelta

if len(sys.argv) < 2:
    print("Usage:")
    print("python analyze.py video.mp4")
    exit()

video_file = sys.argv[1]

cap = cv2.VideoCapture(video_file)

if not cap.isOpened():
    print("Could not open video")
    exit()

qr = cv2.QRCodeDetector()

fps = cap.get(cv2.CAP_PROP_FPS)

if fps <= 0:
    fps = 30

frame_number = 0

detections = []

# Prevent the same QR from being recorded repeatedly
last_detection = {}
COOLDOWN = 3.0

while True:

    ret, frame = cap.read()

    if not ret:
        break

    frame_number += 1

    timestamp = frame_number / fps

    # -------------------------
    # QR DETECTION
    # -------------------------

    data, points, _ = qr.detectAndDecode(frame)

    if data:

        current_time = time.time()

        previous = last_detection.get(data, -999)

        if current_time - previous >= COOLDOWN:

            last_detection[data] = current_time

            detection = {
                "qr_data": data,
                "frame": frame_number,
                "timestamp": timestamp
            }

            detections.append(detection)

            print()
            print("QR CODE DETECTED")
            print("----------------")
            print("Data:", data)
            print("Frame:", frame_number)
            print("Time:", timedelta(seconds=timestamp))

    # -------------------------
    # DISPLAY
    # -------------------------

    if points is not None:

        points = points[0].astype(int)

        for i in range(4):

            cv2.line(
                frame,
                tuple(points[i]),
                tuple(points[(i + 1) % 4]),
                (0, 255, 0),
                3
            )

        if data:

            cv2.putText(
                frame,
                data,
                (points[0][0], points[0][1] - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

    cv2.imshow("QR Analysis", frame)

    # Press Q to stop
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

# -------------------------
# SAVE RESULTS
# -------------------------

with open("qr_results.json", "w") as f:
    json.dump(detections, f, indent=4)

print()
print("==========================")
print("ANALYSIS COMPLETE")
print("==========================")
print(f"QR codes found: {len(detections)}")
print("Results saved to qr_results.json")