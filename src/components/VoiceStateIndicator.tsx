import type { VoiceUiState } from "@/types";
import { VOICE_UI_STATE_COPY } from "@/utils/voiceUi";

interface VoiceStateIndicatorProps {
  state: VoiceUiState;
  /** When true, show compact chip; otherwise include description. */
  compact?: boolean;
}

export function VoiceStateIndicator({ state, compact = false }: VoiceStateIndicatorProps) {
  const copy = VOICE_UI_STATE_COPY[state];

  return (
    <div
      className={`voice-state voice-state--${state}${compact ? " voice-state--compact" : ""}`}
      data-testid="voice-state-indicator"
      data-voice-state={state}
      role="status"
      aria-label={`Voice state: ${copy.title}`}
    >
      <span className="voice-state__orb" aria-hidden="true" />
      <div className="voice-state__copy">
        <p className="voice-state__title">{copy.title}</p>
        {!compact ? <p className="voice-state__description">{copy.description}</p> : null}
      </div>
    </div>
  );
}
