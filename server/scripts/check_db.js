const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'dev.db');
console.log('Opening DB at', dbPath);
const db = new Database(dbPath);
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>r.name);
console.log('tables =', tables);
try{
  const c = db.prepare('SELECT count(*) as c FROM "Log"').get();
  console.log('Log count =', c.c);
} catch(e){
  console.log('Log query failed:', e.message);
}
try{
  const sample = db.prepare('SELECT * FROM "Log" ORDER BY createdAt DESC LIMIT 3').all();
  console.log('Sample rows:', sample);
} catch(e){
  console.log('Sample query failed:', e.message);
}
db.close();
