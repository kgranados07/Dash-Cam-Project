// db.js
// Database layer for the AI Dashcam project: loop-recording segments +
// incident/ticket storage. Uses the `sqlite` + `sqlite3` packages already
// listed in package.json.

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_PATH = path.join(__dirname, 'dashcam.db');

// The four violation types this project currently detects
// (see CODE_TO_EVENT in fixingreading.js and TAG_TO_EVENT in reading.py).
const EVENT_TYPES = {
  SPEEDING: 'speeding',
  STOP_SIGN: 'stop_sign_violation',
  PARKING: 'parking_violation',
  COLLISION: 'collision',
};

// How an event was detected (FR-08: visual cues like a QR/AprilTag read,
// vs. sensor-based collision/impact or airbag-deployment data).
const DETECTION_SOURCES = {
  VISUAL: 'visual',
  COLLISION: 'collision',
  AIRBAG: 'airbag',
};

// Number of loop-recording "slots" kept on disk before the oldest one gets
// overwritten, so storage stays bounded (FR-01, FR-02).
const LOOP_SEGMENT_COUNT = 10;

let db = null;

async function initDb(dbPath = DB_PATH) {
  db = await open({ filename: dbPath, driver: sqlite3.Database });

  // One row per physical video file slot. Writing to a slot that's already
  // used overwrites that slot's old footage (loop recording, FR-02).
  await db.exec(`
    CREATE TABLE IF NOT EXISTS recording_segments (
      slot_index INTEGER PRIMARY KEY,
      file_path TEXT NOT NULL,
      start_ts INTEGER NOT NULL,
      end_ts INTEGER,
      overwritten_at INTEGER
    )
  `);

  // Incident/ticket records (FR-09, FR-10, FR-11, FR-12, FR-25).
  await db.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      zone_id INTEGER,
      timestamp INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      detection_source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid',
      impact_data TEXT,
      clip_path TEXT,
      clip_start_ts INTEGER,
      clip_end_ts INTEGER,
      event_hash TEXT UNIQUE
    )
  `);

  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

/**
 * Track one loop-recording video segment (file path + time window). Calling
 * this again for the same slot overwrites that slot's record, mirroring the
 * old footage being overwritten on disk.
 */
async function recordSegment({ filePath, startTs, endTs = null, slotIndex }) {
  const database = getDb();
  const slot = slotIndex ?? Math.floor(startTs / 1000) % LOOP_SEGMENT_COUNT;

  const existing = await database.get(
    'SELECT * FROM recording_segments WHERE slot_index = ?',
    slot
  );

  if (existing) {
    await database.run(
      `UPDATE recording_segments
       SET file_path = ?, start_ts = ?, end_ts = ?, overwritten_at = ?
       WHERE slot_index = ?`,
      filePath, startTs, endTs, Date.now(), slot
    );
  } else {
    await database.run(
      `INSERT INTO recording_segments (slot_index, file_path, start_ts, end_ts)
       VALUES (?, ?, ?, ?)`,
      slot, filePath, startTs, endTs
    );
  }

  return slot;
}

/**
 * Core write function: persist a detected incident (FR-09, FR-10, FR-11,
 * FR-12, FR-25). Covers all four violation types: speeding,
 * stop_sign_violation, parking_violation, collision.
 */
async function insertIncident({
  id,
  deviceId,
  zoneId = null,
  timestamp = Date.now(),
  eventType,
  detectionSource,
  impactData = null,
  clipPath = null,
  clipStartTs = null,
  clipEndTs = null,
  eventHash,
}) {
  if (!Object.values(EVENT_TYPES).includes(eventType)) {
    throw new Error(`Unknown event type: ${eventType}`);
  }

  const database = getDb();
  const incidentId =
    id || `${eventType}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await database.run(
      `INSERT INTO incidents (
        id, device_id, zone_id, timestamp, event_type, detection_source,
        status, impact_data, clip_path, clip_start_ts, clip_end_ts, event_hash
      ) VALUES (?, ?, ?, ?, ?, ?, 'unpaid', ?, ?, ?, ?, ?)`,
      incidentId,
      deviceId,
      zoneId,
      timestamp,
      eventType,
      detectionSource,
      impactData ? JSON.stringify(impactData) : null,
      clipPath,
      clipStartTs,
      clipEndTs,
      eventHash || incidentId
    );
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      // FR-27: don't create a duplicate record for the same event.
      console.log(`Duplicate event ignored: ${eventHash || incidentId}`);
      return null;
    }
    throw err;
  }

  return incidentId;
}

// Convenience wrappers, one per violation type, so the detection scripts
// (fixingreading.js / reading.py) just pass in what they already have.

async function insertSpeedingIncident({ deviceId, zoneId, speed, clipPath, clipStartTs, clipEndTs, eventHash }) {
  return insertIncident({
    deviceId,
    zoneId,
    eventType: EVENT_TYPES.SPEEDING,
    detectionSource: DETECTION_SOURCES.VISUAL,
    impactData: speed != null ? { speed } : null,
    clipPath,
    clipStartTs,
    clipEndTs,
    eventHash,
  });
}

async function insertStopSignIncident({ deviceId, zoneId, clipPath, clipStartTs, clipEndTs, eventHash }) {
  return insertIncident({
    deviceId,
    zoneId,
    eventType: EVENT_TYPES.STOP_SIGN,
    detectionSource: DETECTION_SOURCES.VISUAL,
    clipPath,
    clipStartTs,
    clipEndTs,
    eventHash,
  });
}

async function insertParkingIncident({ deviceId, zoneId, clipPath, clipStartTs, clipEndTs, eventHash }) {
  return insertIncident({
    deviceId,
    zoneId,
    eventType: EVENT_TYPES.PARKING,
    detectionSource: DETECTION_SOURCES.VISUAL,
    clipPath,
    clipStartTs,
    clipEndTs,
    eventHash,
  });
}

async function insertCollisionIncident({
  deviceId,
  zoneId,
  gForce,
  detectionSource = DETECTION_SOURCES.COLLISION,
  clipPath,
  clipStartTs,
  clipEndTs,
  eventHash,
}) {
  return insertIncident({
    deviceId,
    zoneId,
    eventType: EVENT_TYPES.COLLISION,
    detectionSource, // can be overridden to DETECTION_SOURCES.AIRBAG (FR-08)
    impactData: gForce != null ? { gForce } : null,
    clipPath,
    clipStartTs,
    clipEndTs,
    eventHash,
  });
}

// --- Read helpers (FR-17, FR-18, FR-19, FR-26) ---

async function getIncidentById(id) {
  return getDb().get('SELECT * FROM incidents WHERE id = ?', id);
}

async function getAllIncidents() {
  return getDb().all('SELECT * FROM incidents ORDER BY timestamp DESC');
}

// FR-28: add/pay/contest a ticket.
async function updateIncidentStatus(id, status) {
  return getDb().run('UPDATE incidents SET status = ? WHERE id = ?', status, id);
}

module.exports = {
  initDb,
  getDb,
  EVENT_TYPES,
  DETECTION_SOURCES,
  recordSegment,
  insertIncident,
  insertSpeedingIncident,
  insertStopSignIncident,
  insertParkingIncident,
  insertCollisionIncident,
  getIncidentById,
  getAllIncidents,
  updateIncidentStatus,
}; 