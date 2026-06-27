const provider = 'sqlite';
const currentHourExpr = 'CAST(strftime(\'%H\', "timestamp") AS INTEGER)';
const currentDayBucket = 'strftime(\'%Y-%m-%d\', "timestamp")';
const behaviorType = 'ENERGY';
const userId = undefined;
const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const tagNames: string[] = [];

function buildTagFilter(tagNames?: string[]) {
  if (!tagNames || tagNames.length === 0) {
    return { clause: '', params: [] as string[] };
  }
  const placeholders = tagNames.map(() => '?').join(', ');
  return {
    clause: `AND EXISTS (\n      SELECT 1\n      FROM "LogTag" lt\n      JOIN "Tag" t ON t.id = lt."tagId"\n      WHERE lt."logId" = "Log".id\n        AND t.name IN (${placeholders})\n    )`,
    params: tagNames,
  };
}

const tagFilter = buildTagFilter(tagNames);
const whereFragments = [
  `"behaviorType" = ?`,
  `"outcome" IN ('success', 'fail')`,
];
const params: (string | number)[] = [behaviorType];
if (userId) {
  whereFragments.push(`"userId" = ?`);
  params.push(userId);
}
if (since) {
  whereFragments.push(`"timestamp" >= ?`);
  params.push(since.toISOString());
}
if (tagFilter.clause) {
  whereFragments.push(tagFilter.clause);
  params.push(...tagFilter.params);
}
const whereClause = whereFragments.join(' AND ');
const timeBlockSql = `SELECT\n  CASE\n    WHEN ${currentHourExpr} >= 0 AND ${currentHourExpr} < 6 THEN 'Night'\n    WHEN ${currentHourExpr} >= 6 AND ${currentHourExpr} < 12 THEN 'Morning'\n    WHEN ${currentHourExpr} >= 12 AND ${currentHourExpr} < 17 THEN 'Afternoon'\n    WHEN ${currentHourExpr} >= 17 AND ${currentHourExpr} < 21 THEN 'Evening'\n    ELSE 'Late'\n  END AS "timeBlock",\n  COUNT(*) AS "total",\n  SUM(CASE WHEN "outcome" = 'success' THEN 1 ELSE 0 END) AS "successes"\nFROM "Log"\nWHERE ${whereClause}\nGROUP BY "timeBlock"\nORDER BY "total" DESC`;
console.log(timeBlockSql);
console.log('params', params);
