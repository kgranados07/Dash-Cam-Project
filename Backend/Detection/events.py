"""Convert QR detections into API events and POST them to the Node server."""
import json
import os
import urllib.error
import urllib.request


class Event:
    """A class that describes a traffic event."""

    def __init__(self):
        self.user_id = 0
        self.event_type = None
        self.street_location = None
        self.latitude = None
        self.longitude = None
        self.video_number = None
        self.timestamp = None
        self.timestamp_seconds = None
        self.frame = None

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "event_type": self.event_type,
            "street_location": self.street_location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "video_number": self.video_number,
            "timestamp": self.timestamp,
            "timestamp_seconds": self.timestamp_seconds,
            "frame": self.frame,
        }

    def create(self, detection=None):
        """Parse QR string data into the server's expected field names."""
        detection = detection or {}
        qr_data = detection.get("qr_data", "")
        qrlist = [piece.strip() for piece in str(qr_data).split(",")] if qr_data else []

        try:
            self.event_type = qrlist[0] if len(qrlist) > 0 else None
            self.street_location = qrlist[1] if len(qrlist) > 1 else None
            self.latitude = float(qrlist[2]) if len(qrlist) > 2 else None
            self.longitude = float(qrlist[3]) if len(qrlist) > 3 else None
            self.video_number = detection.get("video")
            self.timestamp = detection.get("timestamp")
            self.timestamp_seconds = detection.get("timestamp_seconds")
            self.frame = detection.get("frame")

            if not self.event_type or not self.street_location:
                raise ValueError("QR payload is missing event_type or street_location")
            if self.latitude is None or self.longitude is None:
                raise ValueError("QR payload is missing latitude or longitude")
            if not (-90 <= self.latitude <= 90 and -180 <= self.longitude <= 180):
                raise ValueError("QR payload coordinates are out of range")
        except (TypeError, ValueError) as exc:
            print("QR failed to parse! Sorry mate!")
            self.user_id = 0
            self.event_type = None
            self.street_location = None
            self.latitude = None
            self.longitude = None
            self.video_number = None
            self.timestamp = None
            self.timestamp_seconds = None
            self.frame = None
            raise ValueError("Invalid QR payload") from exc

        return self


def create_event(detection):
    new_event = Event()
    new_event.create(detection)
    return new_event


def post_event(event: Event, api_url=None, timeout=5):
    api_url = api_url or os.getenv("EVENT_API_URL", "http://localhost:3000/events")
    payload = event.to_dict() if isinstance(event, Event) else event
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        api_url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            response_body = response.read().decode("utf-8")
            return json.loads(response_body) if response_body else {}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Could not POST event to {api_url}: {exc}") from exc


if __name__ == "__main__":
    sample = {
        "qr_data": "Speed,Location Street,0.3434,2.3244",
        "video": "segment_001.mp4",
        "frame": 123,
        "timestamp_seconds": 4.5,
        "timestamp": "0:00:04.500000",
    }
    event = create_event(sample)
    print(event.to_dict())
    try:
        print(post_event(event))
    except RuntimeError as exc:
        print(exc)
