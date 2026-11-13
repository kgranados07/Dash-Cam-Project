const db = require('./db');
exports.findByCode = (code) => db.prepare('SELECT * FROM zones WHERE code = ?').get(code);
exports.getAll = () => db.prepare('SELECT * FROM zones').all();