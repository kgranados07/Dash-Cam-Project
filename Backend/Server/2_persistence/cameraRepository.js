const db = require("../3_config/db");

exports.findById = async (id) => {
    await db.ready;
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM cameras WHERE id = ?", [id], (err, row) => err ? reject(err) : resolve(row));
    });
};