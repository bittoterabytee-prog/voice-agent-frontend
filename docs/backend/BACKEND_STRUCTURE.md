# Backend Structure (Frontend-facing)

This frontend talks to the companion **`voice-agent`** Express backend. Backend source is not in this repository.

## Integration contract (today)

| Item | Value |
| ---- | ----- |
| Base URL env | `VITE_API_BASE_URL` (default `http://localhost:3000`) |
| Health | `GET /health` → `{ "status": "ok" }` |
| Sessions | `POST /api/sessions`, `POST /api/sessions/:callId/complete` |
| Voice turn | `POST /api/voice/turn` |
| Client | `src/services/apiClient.ts` (`apiGet` / `apiPost`) |

## Expected backend layout (companion)

```
src/
├── app.ts / index.ts
├── routes/ controllers/
├── services/          call, domain
├── conversation/      turns
├── tools/             appointmentTools
├── ai/                LLM
├── voice/             STT/TTS
├── repositories/      Postgres access
└── config/            Zod env
```

When adding frontend features, prefer discovering real routes from backend `docs/backend/API_DOCUMENTATION.md` rather than inventing paths.
