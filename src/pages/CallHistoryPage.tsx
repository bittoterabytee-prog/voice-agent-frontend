import { Panel } from "@/components/Panel";

export function CallHistoryPage() {
  return (
    <div className="page" data-testid="history-page">
      <div className="page__intro">
        <h2>Call History</h2>
        <p>Historical transcripts and outcomes will appear here in a later sprint.</p>
      </div>
      <Panel title="Recent Calls">
        <p className="placeholder">Call history is not available yet.</p>
      </Panel>
    </div>
  );
}
