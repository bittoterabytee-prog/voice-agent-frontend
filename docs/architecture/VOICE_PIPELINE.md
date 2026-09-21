# Voice Pipeline (Frontend context)

Voice capture, STT, and TTS are implemented in the **backend** repository (`src/voice/`), not in this dashboard.

## Frontend implications

- This app does **not** open the microphone today.
- Future “live call” views should consume **backend session/call APIs**, not re-implement STT/TTS in the browser unless a ticket says otherwise.
- System Status only proves API reachability (`/health`), not voice-provider readiness.

## Related backend locations (companion repo)

| Concern | Backend path (companion) |
| ------- | ------------------------ |
| Voice service | `src/voice/voiceService.ts` |
| STT / TTS | `src/voice/` |
| Call lifecycle | `src/services/callService.ts` |

See also [`VOICE_BEHAVIOR.md`](../voice/VOICE_BEHAVIOR.md).
