const db = require("../3_config/db");

exports.findById = async (id) => {
    await db.ready;
    return new Promise((resolve, reject) => {
    db.get("SELECT * FROM events WHERE id = ?", [id], (err, row) => err ? reject(err) : resolve(row));
    });
};

exports.insert = async (event) => {
    await db.ready;
    return new Promise((resolve, reject) => {
    const sql = `INSERT INTO events
        (event_type, street_loc, latitude, longitude, video_number, timestamp, timestamp_seconds, frame)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [event.event_type, event.street_location, event.latitude, event.longitude,
        event.video_number, event.timestamp, event.timestamp_seconds, event.frame];
    db.run(sql, params, function (err) {
        if (err) return reject(err);
        db.get("SELECT * FROM events WHERE id = ?", [this.lastID], (selectErr, row) => selectErr ? reject(selectErr) : resolve(row));
    });
    });
};
