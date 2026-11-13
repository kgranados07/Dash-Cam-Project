const db = require('./db');

exports.insert = (e) => {
const info = db.prepare(`INSERT INTO events (zone_id, raw_data, street_loc, latitude, longitude, video_number, timestamp, timestamp_seconds, frame)
VALUES (@zone_id, @raw_data, @street_loc, @latitude, @longitude, @video_number, @timestamp, @timestamp_seconds, @frame)`).run(e);

return db.prepare('SELECT * FROM events WHERE id = ?').get(info.lastInsertRowid);

};