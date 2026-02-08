# Insights and Tests

Quick commands

- Run server (in `server`):

```powershell
cd server
npm install
# ensure DATABASE_URL set if using Postgres; by default local SQLite at server/dev.db is used
npm run dev
```

- Run client (in `client`):

```powershell
cd client
npm install
npm run dev
```

Fetch insights (cached):

```powershell
curl http://localhost:3000/api/insights
```

Force recompute:

```powershell
curl http://localhost:3000/api/insights?force=true
# or
curl -X POST http://localhost:3000/api/insights/refresh
```

List persisted insight history:

```powershell
curl http://localhost:3000/api/insights/history
```

Notes

- Tests: I added analysis and generator code in `intelligence/`. To add unit tests, you can add Jest + ts-jest and create tests under `__tests__`.
- Persistence: Insights are stored in the `Insight` Prisma model (SQLite `server/dev.db`).

