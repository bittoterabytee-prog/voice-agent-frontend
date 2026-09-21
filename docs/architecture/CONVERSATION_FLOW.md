# Conversation Flow (Frontend context)

Conversation turns and the wait/handoff state machine live in the **backend**.

## Frontend role

| Today | Later |
| ----- | ----- |
| No conversation UI | Display transcripts, state badges, tool activity from APIs |
| Placeholders on Calls / History | Bind to backend conversation + call event payloads |

## Rules for UI work

- Do not invent conversation state transitions in the client.
- Treat backend enums/payloads as authoritative when wiring UI.
- Persist nothing conversation-related in `localStorage` unless a ticket requires it and security is reviewed.

Companion backend docs: conversation service, `conversation_states`, `call_events`.
