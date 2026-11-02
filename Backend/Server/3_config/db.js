const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const db = new sqlite3.Database(path.join(__dirname, "../4_database/shop.db"));
const schema = fs.readFileSync(path.join(__dirname, "../4_database/schema.sql"), "utf8");

db.ready = new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
        if (err) return reject(err);
        db.all("PRAGMA table_info(events)", (infoErr, columns) => {
            if (infoErr) return reject(infoErr);
            const existing = new Set(columns.map(column => column.name));
            const migrations = [
                ["latitude", "REAL"], ["longitude", "REAL"], ["video_number", "TEXT"],
                ["timestamp", "TEXT"], ["timestamp_seconds", "REAL"], ["frame", "INTEGER"]
            ].filter(([name]) => !existing.has(name));
            let index = 0;
            const next = (migrationErr) => {
                if (migrationErr) return reject(migrationErr);
                if (index >= migrations.length) {
                    console.log("Database initialized.");
                    return resolve();
                }
                const [name, type] = migrations[index++];
                db.run(`ALTER TABLE events ADD COLUMN ${name} ${type}`, next);
            };
            next();
        });
    });
});

db.ready.catch(err => console.error("Database initialization failed:", err.message));
module.exports = db;
