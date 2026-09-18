import { Panel } from "@/components/Panel";

export function CallsPage() {
  return (
    <div className="page" data-testid="calls-page">
      <div className="page__intro">
        <h2>Calls</h2>
        <p>Active call monitoring will connect here once telephony integrations are wired.</p>
      </div>
      <Panel title="Active Calls">
        <p className="placeholder">No live calls yet. This panel is a placeholder for KAN-6.</p>
      </Panel>
    </div>
  );
}
