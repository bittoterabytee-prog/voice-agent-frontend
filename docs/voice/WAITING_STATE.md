# Waiting State (Frontend context)

When a caller says “hold on” / wait, the **backend** conversation state machine transitions through wait states and emits call events.

## Frontend role

- Later: display states such as `USER_REQUESTED_WAIT`, `WAITING_FOR_USER`, `CALLER_RETURNED` from API payloads.
- Do not implement wait timers that disagree with backend state.
- Do not clear “waiting” in the UI unless the backend says the caller returned or the call ended.
