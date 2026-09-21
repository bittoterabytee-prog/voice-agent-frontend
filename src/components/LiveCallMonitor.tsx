import type { LiveCallSnapshot } from "@/types";
import { CallActivityTimeline } from "@/components/CallActivityTimeline";
import { VoiceStateIndicator } from "@/components/VoiceStateIndicator";
import { conversationStateToVoiceUi, formatConversationState } from "@/utils/voiceUi";

interface LiveCallMonitorProps {
  call: LiveCallSnapshot;
}

function handoffLabel(status: LiveCallSnapshot["handoffStatus"]): string {
  switch (status) {
    case "requested":
      return "Requested";
    case "connected":
      return "Connected to receptionist";
    default:
      return "None";
  }
}

export function LiveCallMonitor({ call }: LiveCallMonitorProps) {
  const voiceUi = conversationStateToVoiceUi(call.conversationState);

  return (
    <div className="live-call" data-testid="live-call-monitor">
      <div className="live-call__hero">
        <div>
          <p className="live-call__eyebrow">Live call · {call.callId}</p>
          <h3 className="live-call__status">Status: {call.status}</h3>
        </div>
        <VoiceStateIndicator state={voiceUi} compact />
      </div>

      <dl className="live-call__metrics" data-testid="live-call-metrics">
        <div>
          <dt>Language</dt>
          <dd>{call.language}</dd>
        </div>
        <div>
          <dt>Conversation state</dt>
          <dd data-testid="live-call-state">{formatConversationState(call.conversationState)}</dd>
        </div>
        <div>
          <dt>Intent</dt>
          <dd>{call.intent}</dd>
        </div>
        <div>
          <dt>Waiting / active</dt>
          <dd>{call.waiting ? "Waiting for user" : "Active conversation"}</dd>
        </div>
        <div>
          <dt>Tool activity</dt>
          <dd>{call.toolActivity ?? "—"}</dd>
        </div>
        <div>
          <dt>Appointment result</dt>
          <dd>{call.appointmentResult ?? "—"}</dd>
        </div>
        <div>
          <dt>Human handoff</dt>
          <dd>{handoffLabel(call.handoffStatus)}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{call.durationLabel}</dd>
        </div>
      </dl>

      {call.errorMessage ? (
        <p className="live-call__error" data-testid="live-call-error" role="alert">
          {call.errorMessage}
        </p>
      ) : null}

      <div className="live-call__activity">
        <h4 className="live-call__activity-title">Activity &amp; state transitions</h4>
        <CallActivityTimeline events={call.activity} />
      </div>
    </div>
  );
}
