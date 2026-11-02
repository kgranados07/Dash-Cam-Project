CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_type TEXT NOT NULL,
    street_loc TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    video_number TEXT,
    timestamp TEXT,
    timestamp_seconds REAL,
    frame INTEGER
);

CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    violation TEXT,
    street_loc TEXT,
    price REAL
);

INSERT OR IGNORE INTO events(id, user_id, event_type, street_loc)
VALUES (1, 456, 'SPEED', 'Getty Square, Yonkers, NY');
