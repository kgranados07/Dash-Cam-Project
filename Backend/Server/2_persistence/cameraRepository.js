const db = require("../3_config/db");

exports.findById = async (id) => {
    await db.ready;
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM cameras WHERE id = ?", [id], (err, row) => err ? reject(err) : resolve(row));
    });
};

exports.insert = async (camera) => {
    await db.ready;
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO cameras (user_id, camera_name) VALUES (?, ?)",
            [camera.user_id, camera.camera_name], function (err) {
                if (err) return reject(err);
                db.get("SELECT * FROM cameras WHERE id = ?", [this.lastID],
                    (selectErr, row) => selectErr ? reject(selectErr) : resolve(row));
            });
    });
};