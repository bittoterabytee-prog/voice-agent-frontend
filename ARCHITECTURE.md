# Architecture Overview

High-level architecture for the **AI Voice Agent Frontend** (operations dashboard).

Related tickets: [KAN-6](https://voiceagentai.atlassian.net/browse/KAN-6), [KAN-9](https://voiceagentai.atlassian.net/browse/KAN-9), [KAN-10](https://voiceagentai.atlassian.net/browse/KAN-10), [KAN-16](https://voiceagentai.atlassian.net/browse/KAN-16), [KAN-19](https://voiceagentai.atlassian.net/browse/KAN-19).

Companion backend repository: `voice-agent` (Express API). This repo contains **UI**, browser microphone capture, and the Sprint 2 voice-turn client.

## Stack

| Layer | Technology |
| ----- | ---------- |
| UI | React 19 + TypeScript |
| Bundler / dev server | Vite 7 |
| Routing | React Router 7 |
| HTTP | `fetch` via `src/services/apiClient.ts` (`apiGet` / `apiPost`) |
| Mic capture | Web Audio PCM (`audioCapture.ts`) + MediaRecorder clips (`clipRecorder.ts`) |
| Tests | Vitest + Testing Library |
| Production serve | nginx (Docker) |

## Component diagram

```
┌──────────────────────────────────────────────┐
│ Browser (Vite / nginx static)                │
│                                              │
│  DashboardLayout + Sidebar                   │
│       │                                      │
│       ├── /          Live call monitor (demo)│
│       ├── /calls     Voice agent + mic tools │
│       ├── /history   Session history (demo)  │
│       └── /settings  SettingsPage            │
│                                              │
│  hooks/useSystemStatus ──► healthService     │
│  hooks/useVoiceAgent ──► sessions + turn API │
│  hooks/useMicrophoneCapture ──► audioCapture │
│  data/demoCallMonitor (KAN-19 until live API)│
│                              │               │
│                              ▼               │
│                         apiClient            │
│                         MediaStream (local)  │
└──────────────────────────────┬───────────────┘
                               │ HTTP
                               │ VITE_API_BASE_URL
                               ▼
                    ┌─────────────────────┐
                    │ Express backend     │
                    │ GET /health         │
                    │ POST /api/sessions  │
                    │ POST /api/voice/turn│
                    └─────────────────────┘
```

## Responsibility map (where to look)

| Question | Primary location |
| -------- | ---------------- |
| App bootstrap | `src/main.tsx`, `src/app/App.tsx` |
| Routes | `src/routes/AppRoutes.tsx` |
| Shell / nav | `src/layouts/DashboardLayout.tsx`, `src/components/Sidebar.tsx` |
| Live call UI design | `docs/frontend/UI_UX_DESIGN.md`, `LiveCallMonitor`, `DashboardPage` |
| Voice agent UI (KAN-16) | `VoiceAgentPanel`, `useVoiceAgent`, `clipRecorder`, `voiceTurnService` |
| Browser mic capture (KAN-10) | `src/services/audioCapture.ts`, `useMicrophoneCapture`, `/calls` |
| Backend base URL | `src/services/apiClient.ts` → `getApiBaseUrl()` |
| Health check | `src/services/healthService.ts`, `src/hooks/useSystemStatus.ts` |
| UI chrome state (sidebar) | `src/store/` |
| Shared types | `src/types/index.ts` |
| Env contract | `.env.example` (`VITE_API_BASE_URL`) |

## What this frontend is (and is not)

- **Is:** Monitoring / administration shell with routing, API client, System Status health probe, browser microphone capture (KAN-10), voice-turn UI wired to `POST /api/voice/turn` (KAN-16), SRD-aligned live-call monitor UI with demo data (KAN-19), and call history table (demo).
- **Is not:** STT/TTS providers, conversation state machine ownership, appointment booking tools, telephony, or PostgreSQL access. Those live in the **backend** repo (except local mic capture and TTS *playback* of backend audio).

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
| Shared MCP + FE/BE knowledge | https://github.com/bittoterabytee-prog/voice-agent-knowledge |
| Mic / STT handoff | [`docs/voice/AUDIO_CAPTURE.md`](docs/voice/AUDIO_CAPTURE.md) |
| Frontend structure | [`docs/frontend/FRONTEND_STRUCTURE.md`](docs/frontend/FRONTEND_STRUCTURE.md) |
| UI/UX design (KAN-19) | [`docs/frontend/UI_UX_DESIGN.md`](docs/frontend/UI_UX_DESIGN.md) |
| System architecture | [`docs/architecture/SYSTEM_ARCHITECTURE.md`](docs/architecture/SYSTEM_ARCHITECTURE.md) |
| Data flow | [`docs/architecture/DATA_FLOW.md`](docs/architecture/DATA_FLOW.md) |
| Voice / conversation (UI context) | [`docs/architecture/`](docs/architecture/), [`docs/voice/`](docs/voice/) |
| Backend / API / DB / AI (contracts) | [`docs/backend/`](docs/backend/), [`docs/database/`](docs/database/), [`docs/ai/`](docs/ai/) |
| Testing | [`docs/testing/TESTING_STRATEGY.md`](docs/testing/TESTING_STRATEGY.md) |
