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
          Sprint 2 E2E demo (KAN-17): mic → session → <code>POST /api/voice/turn</code> → transcript
          + TTS → multi-turn → stop. Browser only — no telephony. Use the capture panel for PCM
          diagnostics.
        </p>
      </div>

      <div className="calls-layout">
        <Panel title="Voice agent" chip="KAN-17">
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
