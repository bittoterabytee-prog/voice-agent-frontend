# Voice Behavior (Frontend context)

Spoken agent behavior (prompts, turn-taking, interruptions) is defined in the backend voice + conversation layers.

## Browser capture (KAN-10)

This frontend owns **microphone permission + PCM capture + metering** only:

- Start/Stop on `/calls`
- Chunk handoff format documented in [`AUDIO_CAPTURE.md`](AUDIO_CAPTURE.md)
- No STT/TTS/LLM in this repo

Dashboard responsibilities when monitoring UIs are added:

- Show agent/user transcript lines from APIs
- Show language / intent / state badges from backend fields
- Do not synthesize “what the agent would say” as live operational truth

## Multilingual voice UI (KAN-29)

On `/calls`, `VoiceAgentPanel` reflects backend session/turn language:

- Seed indicator from `POST /sessions` `language` (English baseline)
- Update from each voice-turn `language` / `languageChanged` (`en` | `hi` | `hinglish`)
- Pass `languageHint` on subsequent turns from the last known session language
- Show a short notice when `languageChanged` is true
- Labels via `formatSessionLanguage` in `src/utils/voiceUi.ts`
