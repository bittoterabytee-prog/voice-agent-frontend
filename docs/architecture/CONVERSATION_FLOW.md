# Conversation Flow (Frontend context)

Conversation turns and the wait/handoff state machine live in the **backend**.

## Frontend role

| Today | Later |
| ----- | ----- |
| Voice agent UI sends turns via HTTP and displays transcript / reply from the backend | Live monitor binds to call event streams |
| Optional durable `callId` via `POST /api/sessions` | Richer wait/handoff chrome from session state |

## Rules for UI work

- Do not invent conversation state transitions in the client.
- Treat backend enums/payloads as authoritative when wiring UI.
- Persist nothing conversation-related in `localStorage` unless a ticket requires it and security is reviewed.

Companion backend docs: conversation service, `conversation_states`, `call_events`.
