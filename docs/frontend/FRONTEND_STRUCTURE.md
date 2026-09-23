# Frontend Structure

Folder map and responsibilities for `voice-agent-frontend` ([KAN-6](https://voiceagentai.atlassian.net/browse/KAN-6), [KAN-9](https://voiceagentai.atlassian.net/browse/KAN-9), [KAN-10](https://voiceagentai.atlassian.net/browse/KAN-10), [KAN-16](https://voiceagentai.atlassian.net/browse/KAN-16), [KAN-17](https://voiceagentai.atlassian.net/browse/KAN-17), [KAN-19](https://voiceagentai.atlassian.net/browse/KAN-19)).

## Tree

```
src/
├── app/                 Application root (providers + router host)
├── components/          Reusable UI (voice agent, mic panel, live call monitor)
├── data/                Demo/mock payloads (live call + history until APIs land)
├── hooks/               Shared hooks (system status, voice agent, mic capture)
├── layouts/             Dashboard chrome (sidebar + outlet)
├── pages/               Route-level screens
├── routes/              React Router route table
├── services/            HTTP client, health, sessions, turn, capture, playback
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
| `/calls` | `CallsPage` | Voice agent E2E (KAN-17) + mic diagnostics (KAN-10) + voice state reference |
| `/history` | `CallHistoryPage` | Recent appointment-agent sessions (demo table) |
| `/settings` | `SettingsPage` | Shows resolved `VITE_API_BASE_URL` |
| `*` | redirect | → `/` |

Nav labels live in `src/utils/constants.ts` (`NAV_ITEMS`).

UI/UX design handoff: [`UI_UX_DESIGN.md`](UI_UX_DESIGN.md).

## HTTP surface used today

| Method | Path | Client helper |
| ------ | ---- | ------------- |
| `GET` | `{VITE_API_BASE_URL}/health` | `fetchHealth()` → `apiGet("/health")` |
| `POST` | `/api/sessions` | `startSession()` |
| `POST` | `/api/sessions/:callId/complete` | `completeSession()` |
| `POST` | `/api/voice/turn` | `postVoiceTurn()` |

See [`docs/backend/API_DOCUMENTATION.md`](../backend/API_DOCUMENTATION.md).

## Browser audio

| API | Helper |
| --- | ------ |
| `MediaRecorder` → base64 clips | `createClipRecorderSession()` in `clipRecorder.ts` (KAN-16 / KAN-17) |
| `navigator.mediaDevices.getUserMedia` + ScriptProcessor | `createAudioCaptureSession()` in `audioCapture.ts` (KAN-10 PCM) |
| `Audio` element playback | `playAudioBase64()` in `audioPlayback.ts` |

See [`docs/voice/AUDIO_CAPTURE.md`](../voice/AUDIO_CAPTURE.md) and [`docs/architecture/VOICE_PIPELINE.md`](../architecture/VOICE_PIPELINE.md).

## Key modules

| Module | Responsibility |
| ------ | -------------- |
| `services/apiClient.ts` | Base URL resolution, `apiGet` / `apiPost`, `ApiError` |
| `services/healthService.ts` | Typed health fetch |
| `services/sessionService.ts` | Start / complete browser sessions |
| `services/voiceTurnService.ts` | `POST /api/voice/turn` |
| `services/clipRecorder.ts` | MediaRecorder clips + level meter |
| `services/audioPlayback.ts` | Play backend `audioBase64` |
| `services/audioCapture.ts` | Mic permission, PCM chunks, errors |
| `hooks/useVoiceAgent.ts` | Start / Send turn / Stop orchestration |
| `hooks/useSystemStatus.ts` | Loading / healthy / error + 30s refresh |
| `hooks/useMicrophoneCapture.ts` | Start/stop PCM capture UI state |
| `components/VoiceAgentPanel.tsx` | Voice agent Start / Send / Stop + transcript |
| `components/MicrophoneCapturePanel.tsx` | PCM Start/Stop, meter, chunk summary |
| `components/LiveCallMonitor.tsx` | SRD §33 live call fields + activity |
| `components/VoiceStateIndicator.tsx` | idle / listening / processing / speaking / error |
| `components/RecentCallsTable.tsx` | History / recent sessions table |
| `data/demoCallMonitor.ts` | Demo live call + history until live APIs |
| `utils/voiceUi.ts` | Conversation state → voice chrome mapping |
| `components/Sidebar.tsx` | Primary navigation |
| `store/uiStore.tsx` | Sidebar open state for mobile |

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Vite on port 5174 |
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
