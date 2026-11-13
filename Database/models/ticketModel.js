const db = require('./db');

const SELECT = `
    SELECT t.id, t.event_id, t.zone_id, t.violation, t.price, t.status, t.created_at,
         t.street_loc, e.video_number, e.frame, e.timestamp_seconds, e.latitude, e.longitude
  FROM tickets t LEFT JOIN events e ON e.id = t.event_id`;

exports.getAll = (status) =>
  status && status !== 'All'
    ? db.prepare(`${SELECT} WHERE t.status = ? ORDER BY t.created_at DESC`).all(status)
    : db.prepare(`${SELECT} ORDER BY t.created_at DESC`).all();

exports.getById = (id) => db.prepare(`${SELECT} WHERE t.id = ?`).get(id);

exports.create = ({ event_id, zone, street_loc }) => {
  const info = db.prepare(`
    INSERT OR IGNORE INTO tickets (event_id, zone_id, violation, street_loc, price)
    VALUES (?, ?, ?, ?, ?)`).run(event_id, zone.id, zone.violation, street_loc, zone.fine);
  return info.changes ? exports.getById(info.lastInsertRowid) : null;
};

exports.updateStatus = (id, status) => {
  db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run(status, id);
  return exports.getById(id);
};