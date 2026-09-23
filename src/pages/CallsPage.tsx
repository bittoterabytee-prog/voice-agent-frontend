import { MicrophoneCapturePanel } from "@/components/MicrophoneCapturePanel";
import { Panel } from "@/components/Panel";
import { VoiceAgentPanel } from "@/components/VoiceAgentPanel";
import { VoiceStateLegend } from "@/components/VoiceStateLegend";

export function CallsPage() {
  return (
    <div className="page" data-testid="calls-page">
      <div className="page__intro">
        <h2>Calls</h2>
        <p>
          Run a browser voice session against the backend turn API (mic →{" "}
          <code>POST /api/voice/turn</code> → play reply), or use the low-level capture panel for
          PCM diagnostics.
        </p>
      </div>

      <div className="calls-layout">
        <Panel title="Voice agent" chip="KAN-16">
          <VoiceAgentPanel />
        </Panel>
        <Panel title="Voice interaction states">
          <VoiceStateLegend />
        </Panel>
        <Panel title="Microphone Capture" chip="KAN-10">
          <MicrophoneCapturePanel />
        </Panel>
      </div>
    </div>
  );
}
