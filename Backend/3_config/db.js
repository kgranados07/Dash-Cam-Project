// Config layer: DB connection
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./4_database/shop.db");

// Initialize schema from schema.sql (creates table automatically)
// Reads the schema.sql file
const fs = require("fs");
const path = require("path");
const schemaPath = path.join(__dirname, "../4_database/schema.sql");

const schema = fs.readFileSync(schemaPath, "utf-8");

// Executes the SQL commands from schema.sql.
db.exec(schema, (err) => {
    if(err) {
        console.error("Error initializing database:", err.message);
    } else {
        console.log("Congratulations! DB initialized with schema.sql");
    }
});

// Exports the db object so the upper layer (persistence) can use it
module.exports = db;