const Database = require('better-sqlite3');
const db = new Database('dev.db');
const sql = `SELECT
  CASE
    WHEN CAST(strftime('%H', "timestamp") AS INTEGER) >= 0 AND CAST(strftime('%H', "timestamp") AS INTEGER) < 6 THEN 'Night'
    WHEN CAST(strftime('%H', "timestamp") AS INTEGER) >= 6 AND CAST(strftime('%H', "timestamp") AS INTEGER) < 12 THEN 'Morning'
    WHEN CAST(strftime('%H', "timestamp") AS INTEGER) >= 12 AND CAST(strftime('%H', "timestamp") AS INTEGER) < 17 THEN 'Afternoon'
    WHEN CAST(strftime('%H', "timestamp") AS INTEGER) >= 17 AND CAST(strftime('%H', "timestamp") AS INTEGER) < 21 THEN 'Evening'
    ELSE 'Late'
  END AS "timeBlock",
  COUNT(*) AS "total",
  SUM(CASE WHEN "outcome" = 'success' THEN 1 ELSE 0 END) AS "successes"
FROM "Log"
WHERE "behaviorType" = ? AND "outcome" IN ('success', 'fail') AND "timestamp" >= ?
GROUP BY "timeBlock"
ORDER BY "total" DESC`;
const rows = db.prepare(sql).all('ENERGY', new Date(Date.now()-30*24*3600*1000).toISOString());
console.log(rows);
