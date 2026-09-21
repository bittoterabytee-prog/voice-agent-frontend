# Backend Services (Frontend-facing)

Services the dashboard will eventually surface. Implementation ownership: **backend repo**.

| Domain | Backend responsibility | Frontend consumer (today / later) |
| ------ | ---------------------- | --------------------------------- |
| Health | Health route | System Status (today) |
| Calls | Call lifecycle service | Calls / History pages (later) |
| Conversation | Turn + state machine | Call detail / transcript (later) |
| Appointments | Tools + repositories | Scheduling widgets (later) |
| LLM / Voice | AI + STT/TTS | Not in this shell today |

Frontend “services” folder (`src/services/`) is the **HTTP adapter** layer only — not a duplicate of backend domain services.
