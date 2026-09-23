# Voice Pipeline (Frontend context)

STT / LLM / TTS run in the **backend** (`voice-agent`). This frontend captures mic audio and calls the orchestrated turn API.

## Preferred Sprint 2 path (KAN-17)

```
Microphone (MediaRecorder clip)
   → base64 audio
   → POST /api/sessions (durable callId; mic granted first)
   → POST /api/voice/turn { audioBase64, mimeType, callId?, sessionId? }
   → show transcript + replyText
   → play audioBase64 (or text-only when ttsError)
   → multi-turn reuses the same callId
   → error → Resume (same callId) or Stop
   → Stop → idle + POST /api/sessions/:callId/complete
```

WebSocket streaming and telephony are **not** required for Sprint 2. E2E smoke: [`docs/testing/E2E_SPRINT2_KAN17.md`](../testing/E2E_SPRINT2_KAN17.md).

## Where it lives in this repo

| Piece | Path |
| ----- | ---- |
| Clip recorder (MediaRecorder → base64) | `src/services/clipRecorder.ts` |
| Turn + session HTTP | `voiceTurnService.ts`, `sessionService.ts` |
| Playback | `src/services/audioPlayback.ts` |
| Hook / UI | `useVoiceAgent.ts`, `VoiceAgentPanel` on `/calls` |
| Low-level PCM diagnostics (KAN-10) | `audioCapture.ts`, `MicrophoneCapturePanel` |

## Related backend locations (companion repo)

| Concern | Backend path (companion) |
| ------- | ------------------------ |
| Turn pipeline | `src/voice/voicePipelineService.ts` |
| STT / TTS / LLM | `src/voice/`, `src/ai/` |
| Sessions | `src/services/sessionService.ts` |

See also [`VOICE_BEHAVIOR.md`](../voice/VOICE_BEHAVIOR.md). Backend contract details live in the companion `voice-agent` repo under `docs/architecture/VOICE_PIPELINE.md`.
