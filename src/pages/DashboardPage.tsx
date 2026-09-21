import { LiveCallMonitor } from "@/components/LiveCallMonitor";
import { Panel } from "@/components/Panel";
import { RecentCallsTable } from "@/components/RecentCallsTable";
import { SystemStatusCard } from "@/components/SystemStatusCard";
import { VoiceStateLegend } from "@/components/VoiceStateLegend";
import { DEMO_LIVE_CALL, DEMO_RECENT_CALLS } from "@/data/demoCallMonitor";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { conversationStateToVoiceUi } from "@/utils/voiceUi";

export function DashboardPage() {
  const { status, refresh } = useSystemStatus();
  const activeVoice = conversationStateToVoiceUi(DEMO_LIVE_CALL.conversationState);

  return (
    <div className="page" data-testid="dashboard-page">
      <div className="page__intro">
        <h2>Live monitoring</h2>
        <p>
          Operator view for the AI Voice Appointment Agent — call status, language, conversation
          state, intent, tools, appointments, handoff, and state transitions (SRD §33). Demo data
          until live call APIs land.
        </p>
      </div>

      <div className="monitor-layout">
        <Panel title="Active call" actions={<span className="panel-chip">Demo feed</span>}>
          <LiveCallMonitor call={DEMO_LIVE_CALL} />
        </Panel>

        <div className="monitor-layout__side">
          <Panel title="Voice UI states">
            <VoiceStateLegend active={activeVoice} />
          </Panel>
          <Panel title="System Status">
            <SystemStatusCard status={status} onRefresh={() => void refresh()} />
          </Panel>
        </div>
      </div>

      <div className="page__section">
        <Panel title="Recent calls">
          <RecentCallsTable calls={DEMO_RECENT_CALLS.slice(0, 3)} />
        </Panel>
      </div>
    </div>
  );
}
