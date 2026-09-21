# Browser Audio Capture (KAN-10)

Frontend-owned microphone capture for the voice-agent POC. Lives in this repository; STT/TTS/LLM remain backend-owned.

## Purpose

- Request browser microphone permission
- Capture a live `MediaStream`
- Emit PCM audio chunks for a future STT client pipeline
- Show basic input-level metering and Start/Stop controls
- Surface permission / device errors clearly

Out of scope: STT, TTS, LLM, telephony, and full agent chrome beyond capture controls.

## Where it lives

| Piece | Path |
| ----- | ---- |
| Capture session + error mapping | `src/services/audioCapture.ts` |
| React hook | `src/hooks/useMicrophoneCapture.ts` |
| UI (Calls page) | `src/components/MicrophoneCapturePanel.tsx` |
| Types | `src/types/index.ts` (`MicrophoneCaptureStatus`, …) |

Route: `/calls` → `CallsPage` hosts **Microphone Capture**.

## Capture flow

```
User presses Start
  → getUserMedia({ audio: true })
  → AudioContext + MediaStreamSource + ScriptProcessor
  → onaudioprocess emits AudioChunk + peak level
User presses Stop
  → disconnect nodes, stop tracks, close AudioContext
```

Chromium-based browsers are the supported target for the POC.

## STT handoff format

Each chunk is an `AudioChunk`:

| Field | Type | Meaning |
| ----- | ---- | ------- |
| `samples` | `Float32Array` | Mono PCM samples in `[-1, 1]` |
| `sampleRate` | `number` | AudioContext sample rate (often 48000) |
| `channelCount` | `1` | Always mono after downmix |
| `format` | `"pcm_f32le"` | Little-endian float32 PCM semantics |
| `sequence` | `number` | Session-local index starting at `0` |
| `timestampMs` | `number` | `performance.now()` at emit time |

Consumers (future STT websocket/HTTP client) should:

1. Subscribe via `createAudioCaptureSession({ onChunk })` or the hook’s `lastChunk` / chunk counter for UI.
2. Convert to the backend codec (e.g. PCM16 / Opus) only at the network boundary.
3. Never assume a fixed sample rate — read `sampleRate` per chunk/session.

UI summary fields (`MicrophoneChunkSummary`) omit the raw `samples` buffer and keep metadata only.

## Error codes

| Code | Typical cause |
| ---- | ------------- |
| `permission_denied` | User blocked mic / insecure context |
| `no_device` | No input device |
| `device_in_use` | Hardware busy |
| `unsupported` | Missing `getUserMedia` / AudioContext |
| `unknown` | Other failures |

## Test cases (KAN-10)

| ID | Expectation |
| -- | ----------- |
| TC-001 | Permission granted → stream active, chunks produced |
| TC-002 | Permission denied → visible error, no silent hang |
| TC-003 | Stop → tracks ended, meter cleared |
| TC-004 | No device → meaningful error |

Automated coverage: `tests/audioCapture.test.ts`, `tests/MicrophoneCapturePanel.test.tsx`.
