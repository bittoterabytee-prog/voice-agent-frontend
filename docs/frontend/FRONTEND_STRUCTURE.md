# Frontend Structure

Folder map and responsibilities for `voice-agent-frontend` ([KAN-6](https://voiceagentai.atlassian.net/browse/KAN-6), [KAN-9](https://voiceagentai.atlassian.net/browse/KAN-9)).

## Tree

```
src/
├── app/                 Application root (providers + router host)
├── components/          Reusable presentational UI
├── hooks/               Shared hooks (system status polling)
├── layouts/             Dashboard chrome (sidebar + outlet)
├── pages/               Route-level screens
├── routes/              React Router route table
├── services/            HTTP client + backend-facing services
├── store/               Lightweight UI state (sidebar open/close)
├── styles/              Global CSS
├── types/               Shared TypeScript types
├── utils/               Nav items, panel placeholders, formatters
├── main.tsx             DOM mount
└── vite-env.d.ts        Vite env typings
tests/                   Vitest + Testing Library
public/                  Static assets
docs/                    Project knowledge (KAN-9)
```

## Routes

| Path | Page | Role today |
| ---- | ---- | ---------- |
| `/` | `DashboardPage` | Overview panels + live System Status |
| `/calls` | `CallsPage` | Active calls placeholder |
| `/history` | `CallHistoryPage` | History placeholder |
| `/settings` | `SettingsPage` | Shows resolved API base URL |
| `*` | redirect | → `/` |

Nav labels live in `src/utils/constants.ts` (`NAV_ITEMS`).

## HTTP surface used today

| Method | Path | Client helper |
| ------ | ---- | ------------- |
| `GET` | `{VITE_API_BASE_URL}/health` | `fetchHealth()` → `apiGet("/health")` |

Expected success body: `{ "status": "ok" }`.

## Key modules

| Module | Responsibility |
| ------ | -------------- |
| `services/apiClient.ts` | Base URL resolution, `apiGet`, `ApiError` |
| `services/healthService.ts` | Typed health fetch |
| `hooks/useSystemStatus.ts` | Loading / healthy / error + 30s refresh |
| `components/SystemStatusCard.tsx` | Status UI + refresh button |
| `components/Sidebar.tsx` | Primary navigation |
| `store/uiStore.tsx` | Sidebar open state for mobile |

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Vite on port 5173 |
| `npm run build` | `tsc -b` + production bundle |
| `npm test` | Vitest |
| `npm run lint` / `format` | ESLint / Prettier |

## Extending the UI

1. Add types under `src/types/`.
2. Add service functions under `src/services/` using `apiClient`.
3. Add hooks if state/polling is shared.
4. Add or extend a page under `src/pages/`.
5. Register the route in `AppRoutes.tsx` and nav in `constants.ts`.
6. Add tests under `tests/`.
7. Update docs if architecture changes.
