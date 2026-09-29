# Decision Log

## Keep Intelligence Pure

The intelligence modules accept plain event data and return findings without importing Prisma, Express, or BullMQ. Database reads, row mapping, persistence, and deduplication belong in server services; this keeps analysis testable and makes later data-model changes local to the mapping boundary. The now-pure library lives at the repository root and is imported by the server.

## Drop Unused Batch Helpers

The root analytics copy exposed `runBatchAnalysis` and `exportAnalyticsReport`, but neither had callers or barrel exports, and their example module depended on a broken Prisma import. We removed the unreferenced helpers instead of preserving an unsupported API. The unique analytics guide was retained in `docs/intelligence-analytics.md` as reference material; its performance claims are not treated as measured results.

## Use Stable Insight IDs

Correlator insights use a deterministic SHA-256-derived `Insight.id` over insight type, user ID, and hour block. Since `Insight.id` is already a database primary key and writes use upsert, repeated and concurrent refreshes of the same key converge on one row without adding a separate dedupe column. A future schema redesign may add a queryable dedupe key if other insight writers need that contract.
