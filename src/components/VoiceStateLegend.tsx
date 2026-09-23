import type { VoiceUiState } from "@/types";
import { VoiceStateIndicator } from "@/components/VoiceStateIndicator";
import { VOICE_UI_STATE_COPY } from "@/utils/voiceUi";

const STATES: VoiceUiState[] = ["idle", "listening", "processing", "speaking", "error"];

interface VoiceStateLegendProps {
  active?: VoiceUiState;
}

/** Static reference of voice chrome states (KAN-16 / KAN-19). */
export function VoiceStateLegend({ active }: VoiceStateLegendProps) {
  return (
    <div className="voice-legend" data-testid="voice-state-legend">
      <p className="voice-legend__intro">
        Voice session chrome maps conversation activity to idle, listening, processing, speaking, and
        error.
      </p>
      <ul className="voice-legend__list">
        {STATES.map((state) => (
          <li
            key={state}
            className={`voice-legend__item${active === state ? " voice-legend__item--active" : ""}`}
          >
            <VoiceStateIndicator state={state} compact />
            <span className="voice-legend__hint">{VOICE_UI_STATE_COPY[state].description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
