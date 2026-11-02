"""Convert QR detections into API events and POST them to the Node server."""
import json
import os
import urllib.request
import urllib.error
from pathlib import Path


def create_event(detection):
    """QR payload must be JSON containing event_type, street_location,
    latitude and longitude. A few common key aliases are accepted.
    """
    raw = detection.get("qr_data", "")
    try:
        qr = json.loads(raw)
    except (TypeError, json.JSONDecodeError) as exc:
        raise ValueError("QR payload must be JSON with event_type, street_location, latitude and longitude") from exc
    if not isinstance(qr, dict):
        raise ValueError("QR JSON payload must be an object")

    def value(*keys):
        for key in keys:
            if qr.get(key) is not None:
                return qr[key]
        return None

    event_type = value("event_type", "eventType", "type")
    street = value("street_location", "streetLocation", "street_loc", "location")
    latitude = value("latitude", "lat")
    longitude = value("longitude", "lon", "lng", "long")
    if not event_type or not street:
        raise ValueError("QR payload is missing event_type or street_location")
    try:
        latitude, longitude = float(latitude), float(longitude)
    except (TypeError, ValueError) as exc:
        raise ValueError("QR payload latitude and longitude must be numeric") from exc
    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise ValueError("QR payload coordinates are out of range")

    video_name = detection.get("video", "")
    return {
        "event_type": str(event_type),
        "street_location": str(street),
        "latitude": latitude,
        "longitude": longitude,
        # The recording filename is a stable segment identifier in this project.
        "video_number": Path(video_name).stem,
        "timestamp": detection.get("timestamp"),
        "timestamp_seconds": detection.get("timestamp_seconds"),
        "frame": detection.get("frame"),
    }


def post_event(event, api_url=None, timeout=5):
    api_url = api_url or os.getenv("EVENT_API_URL", "http://127.0.0.1:3000/events")
    body = json.dumps(event).encode("utf-8")
    request = urllib.request.Request(
        api_url, data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Could not POST event to {api_url}: {exc}") from exc
