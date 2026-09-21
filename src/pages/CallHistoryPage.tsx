import { Panel } from "@/components/Panel";
import { RecentCallsTable } from "@/components/RecentCallsTable";
import { DEMO_RECENT_CALLS } from "@/data/demoCallMonitor";

export function CallHistoryPage() {
  return (
    <div className="page" data-testid="history-page">
      <div className="page__intro">
        <h2>Call History</h2>
        <p>
          Past appointment-agent sessions with language, intent, outcome, and final conversation
          state. Demo rows mirror the SRD appointment flows (book / reschedule / cancel / handoff).
        </p>
      </div>
      <Panel title="Recent sessions" actions={<span className="panel-chip">Demo data</span>}>
        <RecentCallsTable calls={DEMO_RECENT_CALLS} />
      </Panel>
    </div>
  );
}
