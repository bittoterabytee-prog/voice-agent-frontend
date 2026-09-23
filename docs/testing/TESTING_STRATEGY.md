# Testing Strategy (Frontend)

## Tooling

- **Vitest** + **jsdom**
- **Testing Library** + **user-event**
- Setup: `tests/setup.ts`

## What we test today

| Area | File | Covers |
| ---- | ---- | ------ |
| Dashboard load + nav | `tests/App.test.tsx` | TC-002, TC-003 style routes |
| Live call monitor + voice states | `tests/App.test.tsx` | KAN-19 SRD §33 fields, TC-002 voice chrome |
| Call history demo table | `tests/App.test.tsx` | KAN-19 history page |
| Voice UI mapping | `tests/voiceUi.test.ts` | Conversation state → idle/listening/speaking/error |
| Health success / failure | `tests/App.test.tsx` | System Status healthy vs unavailable |
| API base URL | `tests/App.test.tsx`, `tests/apiClient.test.ts` | Env-driven URL |
| Network errors | `tests/apiClient.test.ts` | `ApiError` wrapping |
| Mic capture session | `tests/audioCapture.test.ts` | KAN-10 TC-001–004 (permission, chunks, stop, no device) |
| Mic capture UI | `tests/MicrophoneCapturePanel.test.tsx` | Start/Stop, errors, chunk/level display |
| Voice agent UI | `tests/VoiceAgentPanel.test.tsx` | KAN-16/17 TC-001–009 (listen, transcript, TTS, soft/hard errors, stop, multi-turn, mic deny, Resume) |
| Audio playback | `tests/audioPlayback.test.ts` | base64 → blob + play cleanup |
| API POST / errors | `tests/apiClient.test.ts` | `apiPost`, backend error envelope |

## Expectations for new work

1. **Before changing code**, review related existing tests under `tests/`.
2. **Add or extend tests** for every product change (routes, services, UI behavior, bug fixes). Same change set as the code.
3. Mock `fetch` — do not hit a real backend in unit/component tests. Mock `getUserMedia` / Web Audio for mic tests.
4. Prefer `data-testid` hooks already used (`dashboard-page`, `system-status`, `mic-capture`, etc.).
5. Run `npm test` (and keep lint/format/build green: `npm run lint`, `npm run build`).
6. **Update knowledge** when behavior or coverage changes: this file, plus matching `docs/**` / root architecture docs / `PROJECT_RULES.md` as needed. See [`.cursor/rules/tests-and-knowledge.mdc`](../../.cursor/rules/tests-and-knowledge.mdc).

## Manual checks

- `npm run dev` loads on [http://localhost:5174](http://localhost:5174) without compile errors.
- With backend down, System Status shows Unavailable.
- With backend up on `VITE_API_BASE_URL`, status shows Healthy.
- Resize viewport: sidebar collapses behind Menu on narrow screens.
- On `/calls`, Voice agent Start opens a session and listens; Send turn posts audio; second turn keeps `callId`; Stop releases the mic.
- Sprint 2 smoke checklist: [`E2E_SPRINT2_KAN17.md`](E2E_SPRINT2_KAN17.md).
- On `/calls`, Microphone Capture Start/Stop still exercises low-level PCM diagnostics.
