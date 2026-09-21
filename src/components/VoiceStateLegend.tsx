import type { VoiceUiState } from "@/types";
import { VoiceStateIndicator } from "@/components/VoiceStateIndicator";
import { VOICE_UI_STATE_COPY } from "@/utils/voiceUi";

const STATES: VoiceUiState[] = ["idle", "listening", "speaking", "error"];

interface VoiceStateLegendProps {
  active?: VoiceUiState;
}

/** Static reference of KAN-19 TC-002 voice chrome states. */
export function VoiceStateLegend({ active }: VoiceStateLegendProps) {
  return (
    <div className="voice-legend" data-testid="voice-state-legend">
      <p className="voice-legend__intro">
        Voice session chrome maps SRD conversation states to four operator-facing modes.
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
