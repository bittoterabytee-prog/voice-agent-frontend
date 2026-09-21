# Frontend Structure

Folder map and responsibilities for `voice-agent-frontend` ([KAN-6](https://voiceagentai.atlassian.net/browse/KAN-6), [KAN-9](https://voiceagentai.atlassian.net/browse/KAN-9), [KAN-10](https://voiceagentai.atlassian.net/browse/KAN-10), [KAN-19](https://voiceagentai.atlassian.net/browse/KAN-19)).

## Tree

```
src/
├── app/                 Application root (providers + router host)
├── components/          Reusable UI (mic panel, live call monitor, voice states)
├── data/                Demo/mock payloads (live call + history until APIs land)
├── hooks/               Shared hooks (system status, microphone capture)
├── layouts/             Dashboard chrome (sidebar + outlet)
├── pages/               Route-level screens
├── routes/              React Router route table
├── services/            HTTP client, health, audioCapture
├── store/               Lightweight UI state (sidebar open/close)
├── styles/              Global CSS
├── types/               Shared TypeScript types
├── utils/               Nav items, voice UI mapping, formatters
├── main.tsx             DOM mount
└── vite-env.d.ts        Vite env typings
tests/                   Vitest + Testing Library
public/                  Static assets
docs/                    Project knowledge (KAN-9+)
```

## Routes

| Path | Page | Role today |
| ---- | ---- | ---------- |
| `/` | `DashboardPage` | Live call monitor (SRD §33 demo) + voice legend + System Status |
| `/calls` | `CallsPage` | Browser microphone capture (KAN-10) + voice state reference |
| `/history` | `CallHistoryPage` | Recent appointment-agent sessions (demo table) |
| `/settings` | `SettingsPage` | Shows resolved `VITE_API_BASE_URL` |
| `*` | redirect | → `/` |

Nav labels live in `src/utils/constants.ts` (`NAV_ITEMS`).

UI/UX design handoff: [`docs/frontend/UI_UX_DESIGN.md`](UI_UX_DESIGN.md).

## HTTP surface used today

| Method | Path | Client helper |
| ------ | ---- | ------------- |
| `GET` | `{VITE_API_BASE_URL}/health` | `fetchHealth()` → `apiGet("/health")` |

Expected success body: `{ "status": "ok" }`.

## Browser audio (local, no HTTP)

| API | Helper |
| --- | ------ |
| `navigator.mediaDevices.getUserMedia` | `createAudioCaptureSession()` in `audioCapture.ts` |
| Web Audio `ScriptProcessor` | PCM `pcm_f32le` chunks + peak level |

See [`docs/voice/AUDIO_CAPTURE.md`](../voice/AUDIO_CAPTURE.md).

## Key modules

| Module | Responsibility |
| ------ | -------------- |
| `services/apiClient.ts` | Base URL resolution, `apiGet`, `ApiError` |
| `services/healthService.ts` | Typed health fetch |
| `services/audioCapture.ts` | Mic permission, stream, PCM chunks, errors |
| `hooks/useSystemStatus.ts` | Loading / healthy / error + 30s refresh |
| `hooks/useMicrophoneCapture.ts` | Start/stop capture UI state |
| `components/SystemStatusCard.tsx` | Status UI + refresh button |
| `components/MicrophoneCapturePanel.tsx` | Start/Stop, meter, chunk summary |
| `components/LiveCallMonitor.tsx` | SRD §33 live call fields + activity |
| `components/VoiceStateIndicator.tsx` | idle / listening / speaking / error chrome |
| `components/RecentCallsTable.tsx` | History / recent sessions table |
| `data/demoCallMonitor.ts` | Demo live call + history until live APIs |
| `utils/voiceUi.ts` | Conversation state → voice chrome mapping |
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
2. Add service functions under `src/services/` using `apiClient` (HTTP) or dedicated modules (local device APIs).
3. Add hooks if state/polling is shared.
4. Add or extend a page under `src/pages/`.
5. Register the route in `AppRoutes.tsx` and nav in `constants.ts`.
6. Add tests under `tests/`.
7. Update docs if architecture changes (including [`UI_UX_DESIGN.md`](UI_UX_DESIGN.md) when screens/flows change).
