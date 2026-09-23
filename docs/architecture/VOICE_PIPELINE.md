# Voice Pipeline (Frontend context)

STT / LLM / TTS run in the **backend** (`voice-agent`). This frontend captures mic audio and calls the orchestrated turn API.

## Preferred Sprint 2 path (KAN-16)

```
Microphone (MediaRecorder clip)
   → base64 audio
   → POST /api/sessions (optional durable callId)
   → POST /api/voice/turn { audioBase64, mimeType, callId?, sessionId? }
   → show transcript + replyText
   → play audioBase64 (or text-only when ttsError)
   → Stop → idle + POST /api/sessions/:callId/complete
```

WebSocket streaming is **not** required for Sprint 2.

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
