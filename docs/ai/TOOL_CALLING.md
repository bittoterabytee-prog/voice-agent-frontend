# Tool Calling (Frontend context)

Agent tools (for example appointment availability/booking) execute on the **backend** (`src/tools/`).

## Frontend rules

- Never simulate a successful tool result in UI without an API confirmation.
- Future tool-activity panels should render backend tool call events (args/result/status).
- Booking buttons (when added) call booking APIs only; backend remains source of truth.
