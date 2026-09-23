# API Documentation (Frontend-facing)

## Implemented against

### `GET /health`

- **Purpose:** Liveness for System Status panel.
- **Success:** HTTP 200, JSON `{ "status": "ok" }` (case-insensitive `ok` treated as healthy).
- **Failure:** Network error or non-OK HTTP → UI shows Unavailable; app does not crash.
- **Caller:** `src/services/healthService.ts`.

### `POST /api/sessions` (KAN-16 / KAN-17)

- **Purpose:** Start a durable browser conversation session; UI keeps `callId`.
- **Body:** `{ "callerNumber": "browser", "language": "en" }` (optional fields).
- **Success `201`:** `{ callId, conversationId, callStatus, currentState, … }`.
- **Caller:** `src/services/sessionService.ts` → `startSession()`.
- **Order (KAN-17):** Mic permission is requested before this call so a deny does not open an orphaned session.

### `POST /api/sessions/:callId/complete` (KAN-16 / KAN-17)

- **Purpose:** Best-effort session end when the operator presses Stop.
- **Caller:** `completeSession(callId)`.

### `POST /api/voice/turn` (KAN-16 / KAN-17)

- **Purpose:** One orchestrated voice turn: STT → LLM → TTS.
- **Body:** `{ audioBase64, mimeType, fileName?, sessionId?, conversationId?, callId?, voice? }`.
- **Success `200`:** `{ transcript, replyText, audioBase64?, mimeType?, conversationId, sessionId, ttsError? }`.
- **Soft TTS failure:** `ttsError` present → show `replyText`, skip playback.
- **Hard failure:** `4xx/5xx` with `{ error: { code, message } }` → error chrome; **Resume** keeps the same `callId`.
- **Caller:** `src/services/voiceTurnService.ts` → `postVoiceTurn()`.
- **E2E runbook:** [`docs/testing/E2E_SPRINT2_KAN17.md`](../testing/E2E_SPRINT2_KAN17.md).

Source of truth for shapes: companion backend repo `voice-agent` → `docs/backend/API_DOCUMENTATION.md` (this file mirrors the Sprint 2 UI contract).

## Not yet consumed by this frontend

- Live call monitor / history still use demo payloads (KAN-19) until live event APIs land.
- Appointment availability / booking UI (later sprints).
- WebSocket streaming (deferred; Sprint 2 is HTTP turns only).

## Client conventions

- Always use `apiGet` / `apiPost` in `src/services/apiClient.ts`.
- Never hard-code `http://localhost:3000` in components.
- Surface `ApiError.message` (and optional `code`) in System Status / voice error chrome.
