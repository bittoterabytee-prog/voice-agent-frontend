import type { RecentCallSummary } from "@/types";
import { formatConversationState } from "@/utils/voiceUi";

interface RecentCallsTableProps {
  calls: RecentCallSummary[];
}

export function RecentCallsTable({ calls }: RecentCallsTableProps) {
  if (calls.length === 0) {
    return <p className="placeholder">No recent calls yet.</p>;
  }

  return (
    <div className="recent-calls" data-testid="recent-calls-table">
      <table className="recent-calls__table">
        <thead>
          <tr>
            <th scope="col">Caller</th>
            <th scope="col">Language</th>
            <th scope="col">Intent</th>
            <th scope="col">Outcome</th>
            <th scope="col">Duration</th>
            <th scope="col">Ended</th>
            <th scope="col">Final state</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <tr key={call.id}>
              <td>{call.caller}</td>
              <td>{call.language}</td>
              <td>
                <code>{call.intent}</code>
              </td>
              <td>{call.outcome}</td>
              <td>{call.durationLabel}</td>
              <td>{call.endedAt}</td>
              <td>{formatConversationState(call.stateAtEnd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
