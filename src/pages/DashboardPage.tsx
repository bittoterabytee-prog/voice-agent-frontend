import { Panel } from "@/components/Panel";
import { SystemStatusCard } from "@/components/SystemStatusCard";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { DASHBOARD_PANELS } from "@/utils/constants";

export function DashboardPage() {
  const { status, refresh } = useSystemStatus();

  return (
    <div className="page" data-testid="dashboard-page">
      <div className="page__intro">
        <h2>Overview</h2>
        <p>
          Monitoring shell for live calls, conversation state, appointments, and operational health.
          Detailed widgets land in later sprints.
        </p>
      </div>

      <div className="panel-grid">
        {DASHBOARD_PANELS.map((panel) => (
          <Panel key={panel.id} title={panel.title}>
            {panel.id === "system-status" ? (
              <SystemStatusCard status={status} onRefresh={() => void refresh()} />
            ) : (
              <p className="placeholder">{panel.description}</p>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
