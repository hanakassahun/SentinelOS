const Database = require('better-sqlite3');
const db = new Database('dev.db');
const rows = db.prepare('SELECT "outcome" FROM "Log" LIMIT 1').all();
console.log(rows);
