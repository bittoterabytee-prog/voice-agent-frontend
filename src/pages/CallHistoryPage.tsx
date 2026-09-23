import { useCallback, useEffect, useState } from "react";
import { Panel } from "@/components/Panel";
import { ApiError } from "@/services/apiClient";
import { listSessionEvents, listSessions } from "@/services/sessionService";
import type { SessionEventItem, SessionHistoryItem } from "@/types";
import { formatUsd } from "@/utils/formatUsd";

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

function formatWhen(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatEventLine(event: SessionEventItem): string {
  const meta = event.metadata ?? {};
  const parts: string[] = [event.eventType];

  if (typeof meta.kind === "string" && meta.kind === "voice_pipeline") {
    const stage = typeof meta.stage === "string" ? meta.stage.toUpperCase() : "STAGE";
    const soft = meta.softFail === true ? " soft-fail" : "";
    const code = typeof meta.code === "string" ? ` · ${meta.code}` : "";
    parts.push(`pipeline ${stage}${soft}${code}`);
  } else if (typeof meta.kind === "string" && meta.kind === "openai_usage") {
    const usd = typeof meta.estimatedUsd === "number" ? formatUsd(meta.estimatedUsd) : null;
    parts.push(usd ? `openai usage · ${usd}` : "openai usage");
  } else if (typeof meta.text === "string" && meta.text.trim()) {
    const text = meta.text.trim();
    parts.push(text.length > 80 ? `${text.slice(0, 80)}…` : text);
  } else if (typeof meta.message === "string" && meta.message.trim()) {
    parts.push(meta.message.trim());
  }

  return parts.join(" · ");
}

export function CallHistoryPage() {
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [events, setEvents] = useState<SessionEventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const refreshSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listSessions(50);
      setSessions(rows);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to load call history from the backend.";
      setError(message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  const selectSession = useCallback(async (callId: string) => {
    setSelectedCallId(callId);
    setEventsLoading(true);
    setEventsError(null);
    try {
      const rows = await listSessionEvents(callId);
      setEvents(rows);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Unable to load call events.";
      setEventsError(message);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const selected = sessions.find((s) => s.callId === selectedCallId) ?? null;
  const pipelineFailures = events.filter(
    (e) =>
      e.eventType === "TOOL_FAILED" &&
      e.metadata &&
      (e.metadata as { kind?: unknown }).kind === "voice_pipeline",
  );

  return (
    <div className="page" data-testid="history-page">
      <div className="page__intro">
        <h2>Call History</h2>
        <p>
          Live sessions from the backend with durable <code>call_events</code> (speech, replies,
          estimated OpenAI cost, and KAN-18 pipeline failures). Select a row to inspect logs.
        </p>
      </div>

      <Panel
        title="Recent sessions"
        actions={
          <button type="button" className="button button--ghost" onClick={() => void refreshSessions()}>
            Refresh
          </button>
        }
      >
        {loading ? <p className="placeholder">Loading sessions…</p> : null}
        {error ? (
          <p className="placeholder" data-testid="history-error">
            {error}
          </p>
        ) : null}
        {!loading && !error && sessions.length === 0 ? (
          <p className="placeholder" data-testid="history-empty">
            No sessions yet. Run a voice turn on /calls, then refresh.
          </p>
        ) : null}
        {!loading && !error && sessions.length > 0 ? (
          <div className="recent-calls" data-testid="history-sessions-table">
            <table className="recent-calls__table">
              <thead>
                <tr>
                  <th scope="col">Caller</th>
                  <th scope="col">Language</th>
                  <th scope="col">Status</th>
                  <th scope="col">Intent</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Est. cost</th>
                  <th scope="col">Ended</th>
                  <th scope="col">Final state</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const active = session.callId === selectedCallId;
                  return (
                    <tr
                      key={session.callId}
                      className={active ? "recent-calls__row--active" : undefined}
                      data-testid="history-session-row"
                      data-call-id={session.callId}
                      onClick={() => void selectSession(session.callId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void selectSession(session.callId);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={active}
                    >
                      <td>{session.callerNumber}</td>
                      <td>{session.language}</td>
                      <td>{session.callStatus}</td>
                      <td>
                        <code>{session.intent ?? "—"}</code>
                      </td>
                      <td>{formatDuration(session.durationMs)}</td>
                      <td data-testid="history-session-cost">{formatUsd(session.estimatedUsd)}</td>
                      <td>{formatWhen(session.endTime)}</td>
                      <td>{session.currentState ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>

      <Panel
        title="Session logs"
        actions={
          selected ? (
            <span className="panel-chip" data-testid="history-selected-call">
              {selected.callId.slice(0, 8)}… · {formatUsd(selected.estimatedUsd)}
            </span>
          ) : (
            <span className="panel-chip">Select a session</span>
          )
        }
      >
        {!selectedCallId ? (
          <p className="placeholder" data-testid="history-logs-empty">
            Select a session above to view call_events and pipeline failure logs.
          </p>
        ) : null}
        {selectedCallId && eventsLoading ? <p className="placeholder">Loading events…</p> : null}
        {eventsError ? (
          <p className="placeholder" data-testid="history-logs-error">
            {eventsError}
          </p>
        ) : null}
        {selectedCallId && !eventsLoading && !eventsError ? (
          <div className="voice-agent__pipeline" data-testid="history-session-logs">
            {pipelineFailures.length > 0 ? (
              <>
                <h3 className="voice-agent__transcript-title">Pipeline failures</h3>
                <ul className="voice-agent__pipeline-stages">
                  {pipelineFailures.map((event) => (
                    <li
                      key={event.id}
                      className="voice-agent__pipeline-stage voice-agent__pipeline-stage--fail"
                      data-testid="history-pipeline-failure"
                    >
                      {formatWhen(event.timestamp)} · {formatEventLine(event)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="voice-agent__empty">No pipeline failure events for this session.</p>
            )}

            <h3 className="voice-agent__transcript-title">All call events</h3>
            {events.length === 0 ? (
              <p className="voice-agent__empty">No events recorded.</p>
            ) : (
              <ul className="voice-agent__pipeline-stages" data-testid="history-event-list">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className={
                      event.eventType === "TOOL_FAILED"
                        ? "voice-agent__pipeline-stage voice-agent__pipeline-stage--fail"
                        : "voice-agent__pipeline-stage"
                    }
                    data-testid="history-event-row"
                  >
                    {formatWhen(event.timestamp)} · {formatEventLine(event)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
