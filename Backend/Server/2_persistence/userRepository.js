const db = require("../3_config/db");

exports.findById = async (id) => {
    await db.ready;
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE user_id = ?", [id], (err, row) => err ? reject(err) : resolve(row));
    });
};