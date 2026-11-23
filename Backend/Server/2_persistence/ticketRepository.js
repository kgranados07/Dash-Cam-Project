// Persistence layer: talks to the database and hide all SQL details from the rest of your SW
const db = require("../3_config/db"); // imports the database connection info from db.js (next layer - 3_config)

// SQL query to extract data from db
exports.findById = (id) => {
    return db.ready.then(() => new Promise((resolve, reject) => { // return one record when it's ready from db
        db.get("SELECT * FROM tickets WHERE id = ?", [id], (err, row) => {
            if (err) reject(err); // if there's error in this query, then reject the operation
            else resolve(row); // if not, then return the corresponding record (row)
        });
    }));
};

exports.findAll = async () => {
    await db.ready;
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM tickets ORDER BY id DESC", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.insert = async (ticket) => {
    await db.ready;
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO tickets (user_id, violation, street_loc, price, is_paid, inrealtime) VALUES (?, ?, ?, ?, ?, ?)";
        const params = [ticket.user_id, ticket.violation, ticket.street_loc, ticket.price, ticket.is_paid, ticket.inrealtime];
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            db.get("SELECT * FROM tickets WHERE id = ?", [this.lastID],
                (selectErr, row) => selectErr ? reject(selectErr) : resolve(row));
        });
    });
};

exports.updatePaidStatus = async (id, isPaid) => {
    await db.ready;
    return new Promise((resolve, reject) => {
        db.run("UPDATE tickets SET is_paid = ? WHERE id = ?", [isPaid, id], function (err) {
            if (err) return reject(err);
            if (this.changes === 0) return resolve(null);
            db.get("SELECT * FROM tickets WHERE id = ?", [id],
                (selectErr, row) => selectErr ? reject(selectErr) : resolve(row));
        });
    });
};