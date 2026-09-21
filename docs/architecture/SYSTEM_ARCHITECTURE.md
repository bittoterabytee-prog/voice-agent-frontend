# System Architecture (Frontend context)

## Repositories

| Repo | Role |
| ---- | ---- |
| `voice-agent-frontend` (this) | React operations dashboard |
| `voice-agent` (companion) | Express API, DB, AI, voice, tools |

```
┌─────────────────────┐         HTTP          ┌─────────────────────┐
│ Frontend dashboard  │ ────────────────────► │ Backend API         │
│ React + Vite        │   VITE_API_BASE_URL   │ Express + Postgres  │
└─────────────────────┘                       └─────────────────────┘
```

## Frontend layers

1. **Pages / layouts** — user-visible routes and shell.
2. **Hooks / store** — UI and polling state (not domain persistence).
3. **Services** — outbound HTTP only.
4. **Backend** — authority for calls, appointments, conversation, voice.

## Current vs future

| Capability | Frontend today | Future |
| ---------- | -------------- | ------ |
| Health | `GET /health` | Same |
| Active calls | Placeholder panel | List/detail from call APIs |
| History | Placeholder | Paginated history API |
| Settings | Show API URL | Auth, preferences |
| Voice session UI | Not present | May remain backend-driven or grow here per tickets |

## Non-goals for this repo

- Direct database access
- LLM provider keys in the browser
- Inventing mock “live” operational data without labeling it as mock/demo
