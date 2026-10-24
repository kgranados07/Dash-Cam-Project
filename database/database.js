// db.js
// Sets up database.db and exposes helper functions for reading/writing tickets.
// Uses better-sqlite3 (npm install better-sqlite3) for simple synchronous calls.

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// ---- Schema ----
// zones: the physical QR-marked zones on the track (school zone, stop sign, etc.)
// tickets: one row per detected violation event

db.exec(`
  CREATE TABLE IF NOT EXISTS zones (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    violation_type TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id INTEGER NOT NULL,
    violation_type TEXT NOT NULL,
    speed REAL,
    evidence_path TEXT,
    clip_path TEXT,
    event_hash TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unpaid',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
  );
`);

// Seed the four zones if the table is empty (matches CODE_TO_EVENT in the detection script)
const zoneCount = db.prepare('SELECT COUNT(*) AS count FROM zones').get().count;
if (zoneCount === 0) {
  const insertZone = db.prepare('INSERT INTO zones (id, name, violation_type) VALUES (?, ?, ?)');
  insertZone.run(1, 'Zone 1', 'speeding');
  insertZone.run(2, 'Intersection A', 'stop_sign_violation');
  insertZone.run(3, 'Zone B', 'parking_violation');
  insertZone.run(4, 'Zone 4', 'collision');
}

// ---- Helper functions ----

// Insert a new ticket. Returns the created row, or null if event_hash already exists
// (event_hash has a UNIQUE constraint, so this is the real de-dupe safety net —
// not just the script's in-memory cooldown).
function createTicket({ zoneId, violationType, speed, evidencePath, clipPath, eventHash }) {
  try {
    const insert = db.prepare(`
      INSERT INTO tickets (zone_id, violation_type, speed, evidence_path, clip_path, event_hash)
      VALUES (@zoneId, @violationType, @speed, @evidencePath, @clipPath, @eventHash)
    `);
    const info = insert.run({
      zoneId,
      violationType,
      speed: speed ?? null,
      evidencePath: evidencePath ?? null,
      clipPath: clipPath ?? null,
      eventHash,
    });
    return getTicketById(info.lastInsertRowid);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`Duplicate event_hash "${eventHash}" — ticket already exists, skipping.`);
      return null;
    }
    throw err;
  }
}

function getTicketById(id) {
  return db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
}

// status: 'All' | 'Unpaid' | 'Paid' | 'Contested'
function getAllTickets(status = 'All') {
  if (status === 'All') {
    return db.prepare('SELECT * FROM tickets ORDER BY created_at DESC').all();
  }
  return db.prepare('SELECT * FROM tickets WHERE status = ? ORDER BY created_at DESC').all(status);
}

function updateTicketStatus(id, status) {
  db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run(status, id);
  return getTicketById(id);
}

module.exports = {
  db,
  createTicket,
  getTicketById,
  getAllTickets,
  updateTicketStatus,
};