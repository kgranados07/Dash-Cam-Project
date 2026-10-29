import sqlite3

# Name of the SQLite database file (created automatically if it doesn't exist)
DB_PATH = "tickets.db"


def get_conn():
    """Open a connection to the database."""
    conn = sqlite3.connect(DB_PATH)
    # Lets us read rows like dictionaries (row["status"]) instead of by position
    conn.row_factory = sqlite3.Row
    # SQLite ignores foreign keys by default, so turn them on
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create the tables by running schema.sql. Safe to run many times."""
    # "with" commits the changes automatically when the block finishes
    with get_conn() as conn, open("schema.sql") as f:
        # executescript runs all the SQL statements in the file at once
        conn.executescript(f.read())


def insert_ticket(zone_id, violation, occurred_at, measured, evidence):
    """Save a new ticket. Returns the new ticket ID, or None if it's a duplicate."""
    # Build a unique key for the event (FR-27: no duplicate records)
    # [:19] trims the timestamp to the second: "2026-10-23T14:05:09"
    # same zone + same violation + same second = same event
    event_key = f"{zone_id}|{violation}|{occurred_at[:19]}"
    with get_conn() as conn:
        # The ? marks are placeholders, which keeps the query safe from SQL injection
        # INSERT OR IGNORE skips the insert if event_key already exists (it's UNIQUE)
        cur = conn.execute(
            """INSERT OR IGNORE INTO tickets
               (zone_id, violation, occurred_at, measured, evidence, event_key)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (zone_id, violation, occurred_at, measured, evidence, event_key),
        )
        # rowcount is 0 when the insert was ignored, so return None for duplicates
        return cur.lastrowid if cur.rowcount else None


def get_tickets(status=None):
    """Get all tickets, newest first. Optionally filter by status."""
    # JOIN pulls in the zone's name so the UI can show "School Zone"
    q = """SELECT t.*, z.name AS zone_name FROM tickets t
           JOIN zones z ON z.zone_id = t.zone_id"""
    args = ()
    # Only filter if a specific status was requested ("all" means no filter)
    if status and status != "all":
        q += " WHERE t.status = ?"
        args = (status,)
    # Newest tickets first
    q += " ORDER BY t.occurred_at DESC"
    with get_conn() as conn:
        # Convert each row to a plain dict so Flask can turn it into JSON
        return [dict(r) for r in conn.execute(q, args)]


def get_ticket(ticket_id):
    """Get one ticket by ID (for the detail view). Returns None if not found."""
    with get_conn() as conn:
        # fetchone() returns a single row, or None if nothing matches
        row = conn.execute(
            """SELECT t.*, z.name AS zone_name FROM tickets t
               JOIN zones z ON z.zone_id = t.zone_id
               WHERE t.ticket_id = ?""", (ticket_id,)).fetchone()
        return dict(row) if row else None


def set_status(ticket_id, status):
    """Change a ticket's status to 'unpaid', 'paid', or 'contested'."""
    with get_conn() as conn:
        # The CHECK rule in schema.sql rejects any other status value
        conn.execute("UPDATE tickets SET status = ? WHERE ticket_id = ?",
                     (status, ticket_id))