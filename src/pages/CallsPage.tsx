import { MicrophoneCapturePanel } from "@/components/MicrophoneCapturePanel";
import { Panel } from "@/components/Panel";

export function CallsPage() {
  return (
    <div className="page" data-testid="calls-page">
      <div className="page__intro">
        <h2>Calls</h2>
        <p>
          Browser microphone capture for the voice-agent POC. Start/stop controls request permission,
          stream PCM chunks for a future STT handoff, and show basic input metering. No telephony or
          phone-number setup is required.
        </p>
      </div>
      <Panel title="Microphone Capture">
        <MicrophoneCapturePanel />
      </Panel>
    </div>
  );
}
