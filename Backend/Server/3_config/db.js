const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const db = new sqlite3.Database(path.join(__dirname, "../4_database/database.db"));
const schema = fs.readFileSync(path.join(__dirname, "../4_database/schema.sql"), "utf8");

const ensureColumns = (table, columns) => new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (infoErr, existingColumns) => {
        if (infoErr) return reject(infoErr);
        const existing = new Set(existingColumns.map(column => column.name));
        const missing = columns.filter(([name]) => !existing.has(name));
        let index = 0;
        const next = (migrationErr) => {
            if (migrationErr) return reject(migrationErr);
            if (index >= missing.length) return resolve();
            const [name, type] = missing[index++];
            db.run(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`, next);
        };
        next();
    });
});

db.ready = new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
        if (err) return reject(err);
        ensureColumns("events", [
            ["user_id", "INTEGER"], ["latitude", "REAL"], ["longitude", "REAL"],
            ["video_number", "TEXT"], ["timestamp", "TEXT"], ["timestamp_seconds", "REAL"],
            ["frame", "INTEGER"], ["inrealtime", "TEXT"]
        ])
            .then(() => ensureColumns("tickets", [
                ["is_paid", "INTEGER DEFAULT 0"], ["inrealtime", "TEXT"]
            ]))
            .then(() => {
                console.log("Database initialized.");
                resolve();
            }, reject);
    });
});

db.ready.catch(err => console.error("Database initialization failed:", err.message));
module.exports = db;
