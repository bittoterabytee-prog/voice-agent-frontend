# Architecture Overview

High-level architecture for the **AI Voice Agent Frontend** (operations dashboard).

Related tickets: [KAN-6](https://voiceagentai.atlassian.net/browse/KAN-6), [KAN-9](https://voiceagentai.atlassian.net/browse/KAN-9).

Companion backend repository: `voice-agent` (Express API). This repo contains **UI only**.

## Stack

| Layer | Technology |
| ----- | ---------- |
| UI | React 19 + TypeScript |
| Bundler / dev server | Vite 7 |
| Routing | React Router 7 |
| HTTP | `fetch` via `src/services/apiClient.ts` |
| Tests | Vitest + Testing Library |
| Production serve | nginx (Docker) |

## Component diagram

```
┌──────────────────────────────────────────────┐
│ Browser (Vite / nginx static)                │
│                                              │
│  DashboardLayout + Sidebar                   │
│       │                                      │
│       ├── /          DashboardPage           │
│       ├── /calls     CallsPage (placeholder) │
│       ├── /history   CallHistoryPage         │
│       └── /settings  SettingsPage            │
│                                              │
│  hooks/useSystemStatus ──► healthService     │
│                              │               │
│                              ▼               │
│                         apiClient.apiGet     │
└──────────────────────────────┬───────────────┘
                               │ HTTP
                               │ VITE_API_BASE_URL
                               ▼
                    ┌─────────────────────┐
                    │ Express backend     │
                    │ GET /health         │
                    │ (future call APIs)  │
                    └─────────────────────┘
```

## Responsibility map (where to look)

| Question | Primary location |
| -------- | ---------------- |
| App bootstrap | `src/main.tsx`, `src/app/App.tsx` |
| Routes | `src/routes/AppRoutes.tsx` |
| Shell / nav | `src/layouts/DashboardLayout.tsx`, `src/components/Sidebar.tsx` |
| Dashboard panels | `src/pages/DashboardPage.tsx` |
| Backend base URL | `src/services/apiClient.ts` → `getApiBaseUrl()` |
| Health check | `src/services/healthService.ts`, `src/hooks/useSystemStatus.ts` |
| UI chrome state (sidebar) | `src/store/` |
| Shared types | `src/types/index.ts` |
| Env contract | `.env.example` (`VITE_API_BASE_URL`) |

## What this frontend is (and is not)

- **Is:** Monitoring / administration shell with routing, API client, System Status health probe, and placeholders for Active Calls / Recent Calls.
- **Is not:** STT/TTS, conversation state machine, appointment booking tools, or PostgreSQL access. Those live in the **backend** repo.

## Design principles

- Backend APIs are the **source of truth** for calls, appointments, and conversation state.
- The browser must never invent availability or booking success.
- Only public client config (API base URL) is allowed in Vite env — no secrets in the frontend bundle.
- When UI architecture changes, update docs under `docs/` and root `ARCHITECTURE.md` / `SYSTEM_FLOW.md`.

## Documentation index

| Doc | Path |
| --- | ---- |
| End-to-end flow | [`SYSTEM_FLOW.md`](SYSTEM_FLOW.md) |
| Project rules | [`PROJECT_RULES.md`](PROJECT_RULES.md) |
| MCP setup | [`docs/mcp/MCP_SETUP.md`](docs/mcp/MCP_SETUP.md) |
| Frontend structure | [`docs/frontend/FRONTEND_STRUCTURE.md`](docs/frontend/FRONTEND_STRUCTURE.md) |
| System architecture | [`docs/architecture/SYSTEM_ARCHITECTURE.md`](docs/architecture/SYSTEM_ARCHITECTURE.md) |
| Data flow | [`docs/architecture/DATA_FLOW.md`](docs/architecture/DATA_FLOW.md) |
| Voice / conversation (UI context) | [`docs/architecture/`](docs/architecture/), [`docs/voice/`](docs/voice/) |
| Backend / API / DB / AI (contracts) | [`docs/backend/`](docs/backend/), [`docs/database/`](docs/database/), [`docs/ai/`](docs/ai/) |
| Testing | [`docs/testing/TESTING_STRATEGY.md`](docs/testing/TESTING_STRATEGY.md) |
