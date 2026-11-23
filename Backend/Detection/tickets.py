"""Build and upload confirmed traffic violations as tickets."""
import json
import math
import os
import urllib.error
import urllib.request


class Ticket:
    """Ticket payload accepted by the Node server's POST /tickets route."""

    def __init__(self, violation, street_location, price, user_id=None, is_paid=0, inrealtime=None):
        if not isinstance(violation, str) or not violation.strip():
            raise ValueError("violation is required")
        if not isinstance(street_location, str) or not street_location.strip():
            raise ValueError("street_location is required")
        if isinstance(price, bool) or not isinstance(price, (int, float)):
            raise ValueError("price must be a non-negative number")
        if not math.isfinite(price) or price < 0:
            raise ValueError("price must be a non-negative number")
        if user_id is not None and (
            isinstance(user_id, bool) or not isinstance(user_id, int) or user_id <= 0
        ):
            raise ValueError("user_id must be a positive integer")
        if isinstance(is_paid, bool):
            is_paid = int(is_paid)
        if not isinstance(is_paid, int) or is_paid not in (0, 1):
            raise ValueError("is_paid must be 0 or 1")

        self.violation = violation.strip()
        self.street_location = street_location.strip()
        self.price = price
        self.user_id = user_id
        self.is_paid = is_paid
        self.inrealtime = inrealtime

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "violation": self.violation,
            "street_loc": self.street_location,
            "price": self.price,
            "is_paid": self.is_paid,
            "inrealtime": self.inrealtime,
        }


def post_ticket(ticket, api_url=None, timeout=5):
    """POST a confirmed violation to the Node server and return its response."""
    api_url = api_url or os.getenv("TICKET_API_URL", "http://localhost:3000/tickets")
    payload = ticket.to_dict() if isinstance(ticket, Ticket) else ticket
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
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Ticket API returned HTTP {exc.code}: {error_body}"
        ) from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Could not POST ticket to {api_url}: {exc}") from exc

