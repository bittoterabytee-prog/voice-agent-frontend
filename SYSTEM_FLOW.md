# System Flow

End-to-end flows as seen from the **frontend dashboard** repository.

> Voice capture, STT/TTS, LLM, tools, and PostgreSQL run in the companion **backend** repo (`voice-agent`). This document describes what the UI does today and how it will attach to those flows later.

## Primary flow (dashboard ↔ backend)

```
Developer / operator opens UI
  http://localhost:5173 (Vite) or nginx:80
      │
      ▼
React app boots
  src/main.tsx → src/app/App.tsx → BrowserRouter
      │
      ▼
DashboardLayout + Sidebar navigation
      │
      ├── /          Overview panels
      ├── /calls     Active calls placeholder
      ├── /history   Call history placeholder
      └── /settings  Shows resolved VITE_API_BASE_URL
      │
      ▼
Dashboard System Status panel
  useSystemStatus → fetchHealth → GET {VITE_API_BASE_URL}/health
      │
      ├── 200 + { status: "ok" }  → Healthy
      ├── network / non-OK        → Unavailable (error message, no crash)
      └── loading                 → Checking…
```

## Intended future: live call monitoring (not implemented yet)

```
Backend call / conversation APIs (backend repo)
      │
      ▼
Frontend services (to be added under src/services/)
      │
      ▼
Calls / History pages replace placeholders
      │
      ▼
Panels show active calls, transcripts, tool activity, errors
```

Until those APIs are wired, **do not fabricate live call lists** in the UI.

## Appointment / booking (frontend role)

```
Operator views scheduling-related UI (future)
      │
      ▼
Frontend calls backend appointment APIs only
      │
      ▼
Backend tools + PostgreSQL remain source of truth
  (see backend SYSTEM_FLOW.md / appointmentTools)
```

The frontend must never invent availability or confirm booking without API success.

## Wait / “hold on” (frontend role)

Wait / hold-on conversation states are owned by the **backend** conversation state machine. The dashboard may later **display** those states from API payloads; it does not own the state transitions.

See [`docs/voice/WAITING_STATE.md`](docs/voice/WAITING_STATE.md) and [`docs/architecture/CONVERSATION_FLOW.md`](docs/architecture/CONVERSATION_FLOW.md).

## Where to look

| Question | Answer in this repo |
| -------- | ------------------- |
| How does the app start? | `src/main.tsx` |
| How does health probing work? | `src/hooks/useSystemStatus.ts`, `src/services/healthService.ts` |
| Where is the API base URL? | `getApiBaseUrl()` in `src/services/apiClient.ts` |
| Where do I add a page? | `src/pages/` + route in `src/routes/AppRoutes.tsx` + nav in `src/utils/constants.ts` |
| Full voice/call pipeline? | Companion backend docs — summarized under `docs/architecture/` and `docs/voice/` here for MCP context |
