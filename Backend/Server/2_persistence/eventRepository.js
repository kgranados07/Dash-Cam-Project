// Persistence layer: talks to the database and hide all SQL details from the rest of your SW
const db = require("../3_config/db"); // imports the database connection info from db.js (next layer - 3_config)

// SQL query to extract data from db
exports.findById = (id) => {
    return new Promise((resolve, reject) => { // return one record when it's ready from db
        db.get("SELECT * FROM events WHERE id = ?", [id], (err, row) => {
            if (err) reject(err); // if there's error in this query, then reject the operation
            else resolve(row); // if not, then return the corresponding record (row)
        });
    });
};