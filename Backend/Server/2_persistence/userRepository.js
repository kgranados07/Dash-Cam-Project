const db = require("../3_config/db");

exports.findById = async (id) => {
    await db.ready;
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE user_id = ?", [id], (err, row) => err ? reject(err) : resolve(row));
    });
};

exports.insert = async (user) => {
    await db.ready;
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO users (username, password_) VALUES (?, ?)",
            [user.username, user.password], function (err) {
                if (err) return reject(err);
                db.get("SELECT * FROM users WHERE internal_id = ?", [this.lastID],
                    (selectErr, row) => selectErr ? reject(selectErr) : resolve(row));
            });
    });
};