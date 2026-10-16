import cv2
from datetime import datetime

CAMERA = 0
WIDTH = 1280
HEIGHT = 720
FPS = 30

cap = cv2.VideoCapture(CAMERA, cv2.CAP_DSHOW)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, WIDTH)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, HEIGHT)
cap.set(cv2.CAP_PROP_FPS, FPS)

if not cap.isOpened():
    print("Could not open camera")
    exit()

# Create a unique filename
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"driving_{timestamp}.mp4"

fourcc = cv2.VideoWriter_fourcc(*"mp4v")

out = cv2.VideoWriter(
    filename,
    fourcc,
    FPS,
    (WIDTH, HEIGHT)
)

print(f"Recording to {filename}")
print("Press Q to stop.")

while True:

    ret, frame = cap.read()

    if not ret:
        print("Could not read camera")
        break

    # Save frame
    out.write(frame)

    # Show camera
    cv2.imshow("Recording", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
out.release()
cv2.destroyAllWindows()

print(f"Saved: {filename}")