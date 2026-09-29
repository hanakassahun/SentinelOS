# Decision Log

## Keep Intelligence Pure

The intelligence modules accept plain event data and return findings without importing Prisma, Express, or BullMQ. Database reads, row mapping, persistence, and deduplication belong in server services; this keeps analysis testable and makes later data-model changes local to the mapping boundary. The now-pure library lives at the repository root and is imported by the server.

## Drop Unused Batch Helpers

The root analytics copy exposed `runBatchAnalysis` and `exportAnalyticsReport`, but neither had callers or barrel exports, and their example module depended on a broken Prisma import. We removed the unreferenced helpers instead of preserving an unsupported API. The unique analytics guide was retained in `docs/intelligence-analytics.md` as reference material; its performance claims are not treated as measured results.

## Use Stable Insight IDs

Correlator insights use a deterministic SHA-256-derived `Insight.id` over insight type, user ID, and hour block. Since `Insight.id` is already a database primary key and writes use upsert, repeated and concurrent refreshes of the same key converge on one row without adding a separate dedupe column. A future schema redesign may add a queryable dedupe key if other insight writers need that contract.

## Keep Local User Selection Explicitly Untrusted

The current API accepts a `userId` query/body value because the application does not yet have session authentication. This is acceptable only for a local, single-user installation. Do not expose the server to a network or deploy it until authentication is added and user identity is derived from the authenticated session instead of request input.

## Run Insight Jobs Inline by Default

The app is local-first, so insight generation runs inline by default and does not require Redis. Redis-backed queueing is opt-in with `QUEUE_MODE=redis`; the worker starts explicitly from the server entry point only after a bounded Redis availability check. Queue requests fail with HTTP 503 when Redis cannot accept work.
