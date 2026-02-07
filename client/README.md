# Client

This folder follows a feature-driven structure tailored for sentinelOS.

- `app/` — routing and layout (thin orchestration)
- `components/` — reusable presentation components (LEGO pieces)
- `features/` — domain modules: `auth`, `logging`, `insights`, `planning`, `dashboard`
- `providers/` — global React providers (AuthProvider, InsightProvider)
- `lib/` — client-side intelligence helpers (formatters, adapters)
- `hooks/` — global custom hooks
- `types/` — TypeScript domain models (`BehavioralEvent`, `Insight`)
- `utils/` — small stateless helpers

Guidelines:
- Keep UI components dumb and presentation-only.
- Put feature-specific logic inside `features/<name>`.
- Use `lib/` for cross-feature intelligence formatting and adapters.
