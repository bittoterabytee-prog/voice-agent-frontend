import { MicrophoneCapturePanel } from "@/components/MicrophoneCapturePanel";
import { Panel } from "@/components/Panel";
import { VoiceStateLegend } from "@/components/VoiceStateLegend";

export function CallsPage() {
  return (
    <div className="page" data-testid="calls-page">
      <div className="page__intro">
        <h2>Calls</h2>
        <p>
          Capture browser audio for the POC, and preview the voice interaction chrome operators see
          during a live session (idle, listening, speaking, error).
        </p>
      </div>

      <div className="calls-layout">
        <Panel title="Microphone Capture">
          <MicrophoneCapturePanel />
        </Panel>
        <Panel title="Voice interaction states">
          <VoiceStateLegend />
        </Panel>
      </div>
    </div>
  );
}
