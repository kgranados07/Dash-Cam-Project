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
    frame INTEGER,
    inrealtime TEXT
);

CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    violation TEXT,
    street_loc TEXT,
    price REAL,
    is_paid INTEGER DEFAULT 0,
    inrealtime TEXT
);

CREATE TABLE IF NOT EXISTS users (
    internal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE DEFAULT (abs(random()) % 9000000000 + 1000000000),
    username TEXT,
    password_ TEXT
);

CREATE TABLE IF NOT EXISTS cameras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    camera_name TEXT
);

INSERT OR IGNORE INTO events(id, user_id, event_type, street_loc)
VALUES (1, 456, 'SPEED', 'Getty Square, Yonkers, NY');

INSERT or IGNORE INTO users(user_id,username,password_)
VALUES (1233453,"User123","password123")

INSERT or IGNORE INTO tickets(user_id,violation,street_loc,price,is_paid,inrealtime)
VALUES(1233453,"Parking","Main St",230.00,0,"12:34")
