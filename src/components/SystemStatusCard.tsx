import { StatusBadge } from "@/components/StatusBadge";
import { formatTimestamp } from "@/utils/constants";
import type { SystemStatus } from "@/types";

interface SystemStatusCardProps {
  status: SystemStatus;
  onRefresh: () => void;
}

function stateLabel(state: SystemStatus["state"]): string {
  switch (state) {
    case "healthy":
      return "Healthy";
    case "loading":
      return "Checking";
    case "error":
      return "Unavailable";
    default:
      return "Idle";
  }
}

export function SystemStatusCard({ status, onRefresh }: SystemStatusCardProps) {
  return (
    <div className="system-status" data-testid="system-status">
      <div className="system-status__row">
        <StatusBadge state={status.state} label={stateLabel(status.state)} />
        <button
          type="button"
          className="button button--ghost"
          onClick={onRefresh}
          disabled={status.state === "loading"}
        >
          Refresh
        </button>
      </div>
      <p className="system-status__message" data-testid="system-status-message">
        {status.message}
      </p>
      <dl className="system-status__meta">
        <div>
          <dt>API base URL</dt>
          <dd data-testid="api-base-url">{status.apiBaseUrl}</dd>
        </div>
        <div>
          <dt>Last checked</dt>
          <dd>{formatTimestamp(status.checkedAt)}</dd>
        </div>
      </dl>
    </div>
  );
}
