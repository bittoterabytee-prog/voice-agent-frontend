# System Flow

End-to-end flows as seen from the **frontend dashboard** repository.

> STT/TTS, LLM, tools, and PostgreSQL run in the companion **backend** repo (`voice-agent`). Browser microphone capture (KAN-10) and voice-turn UI (KAN-16) run in this frontend. This document describes what the UI does today and how it attaches to backend flows.

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
      ├── /          Live call monitor (KAN-19 demo) + System Status
      ├── /calls     Voice agent (KAN-16) + mic diagnostics (KAN-10) + voice states
      ├── /history   Call history table (KAN-19 demo)
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

## Browser voice agent (KAN-16)

```
Operator opens /calls → Voice agent → Start
      │
      ▼
POST /api/sessions → callId
      │
      ▼
MediaRecorder clip capture (mic permission)
      │
      ├── Send turn → base64 → POST /api/voice/turn
      │                 ├── show transcript + replyText
      │                 ├── play audioBase64 (or ttsError notice)
      │                 └── resume listening
      └── Stop → idle; POST /api/sessions/:callId/complete
```

No WebSocket in Sprint 2. Details: [`docs/architecture/VOICE_PIPELINE.md`](docs/architecture/VOICE_PIPELINE.md).

## Browser microphone capture (KAN-10)

```
Operator opens /calls → Microphone Capture → Start
      │
      ▼
getUserMedia + Web Audio ScriptProcessor
      │
      ├── permission denied / no device → visible error on panel
      ├── capturing → PCM float32 chunks + level meter
      └── Stop → tracks stopped, AudioContext closed
```

Chunk handoff format: [`docs/voice/AUDIO_CAPTURE.md`](docs/voice/AUDIO_CAPTURE.md).

## Live call monitoring UI (KAN-19)

Design handoff: [`docs/frontend/UI_UX_DESIGN.md`](docs/frontend/UI_UX_DESIGN.md).

```
Operator opens /
      │
      ▼
LiveCallMonitor renders SRD §33 fields
  (status, language, state, intent, wait, tools, appointment, handoff, duration, errors)
      │
      ├── Demo payload: src/data/demoCallMonitor.ts
      └── Future: replace with WebSocket / SSE / REST call feed
      │
      ▼
Activity timeline shows operational state transitions
  (no private chain-of-thought)
```

Until live APIs are wired, the monitor uses **clearly labeled demo data** so screens and components are implementation-ready. Demo rows must not be treated as real bookings.

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
