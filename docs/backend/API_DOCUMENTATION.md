# API Documentation (Frontend-facing)

## Implemented against

### `GET /health`

- **Purpose:** Liveness for System Status panel.
- **Success:** HTTP 200, JSON `{ "status": "ok" }` (case-insensitive `ok` treated as healthy).
- **Failure:** Network error or non-OK HTTP → UI shows Unavailable; app does not crash.
- **Caller:** `src/services/healthService.ts`.

## Not yet consumed by this frontend

Future dashboard features will call backend APIs for:

- Active / recent calls
- Conversation transcripts and state
- Appointment availability and booking confirmations
- Operational errors / tool activity

Until those endpoints are documented and wired, pages must remain placeholders or clearly labeled demos.

## Client conventions

- Always use `apiGet` / future `apiPost` wrappers in `src/services/`.
- Never hard-code `http://localhost:3000` in components.
- Surface `ApiError.message` to System Status / toasts.
