import { VoiceStateIndicator } from "@/components/VoiceStateIndicator";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import type { PipelineStageSummary, VoiceUiState } from "@/types";
import { formatUsd } from "@/utils/formatUsd";
import { formatSessionLanguage } from "@/utils/voiceUi";

function formatStage(stage: PipelineStageSummary): string {
  const soft = stage.softFail ? " (soft-fail)" : "";
  const code = stage.code ? ` · ${stage.code}` : "";
  return `${stage.stage.toUpperCase()} · ${stage.outcome}${soft} · ${stage.durationMs}ms${code}`;
}

export function VoiceAgentPanel() {
  const { status, start, sendTurn, stop } = useVoiceAgent();
  const phase = status.phase as VoiceUiState;
  const isIdle = phase === "idle";
  const isError = phase === "error";
  const canSend = phase === "listening";
  const canStop = !isIdle;
  const levelPercent = Math.round(status.level * 100);
  const pipeline = status.lastPipeline;
  const lastCost = status.lastCost;

  return (
    <div className="voice-agent" data-testid="voice-agent">
      <div className="voice-agent__row">
        <VoiceStateIndicator state={phase} compact />
        <div className="voice-agent__actions">
          <button
            type="button"
            className="button"
            data-testid="voice-start"
            onClick={() => void start()}
            disabled={!isIdle && !isError}
          >
            Start
          </button>
          <button
            type="button"
            className="button"
            data-testid="voice-send-turn"
            onClick={() => void sendTurn()}
            disabled={!canSend}
          >
            Send turn
          </button>
          <button
            type="button"
            className="button button--ghost"
            data-testid="voice-stop"
            onClick={() => void stop()}
            disabled={!canStop}
          >
            Stop
          </button>
        </div>
      </div>

      <p className="voice-agent__message" data-testid="voice-agent-message">
        {status.message}
      </p>

      {status.languageNotice ? (
        <p className="voice-agent__language-notice" data-testid="voice-language-notice">
          {status.languageNotice}
        </p>
      ) : null}

      <div className="voice-agent__meter" data-testid="voice-level-meter">
        <div className="voice-agent__meter-label">
          <span>Input level</span>
          <span data-testid="voice-level-value">{levelPercent}%</span>
        </div>
        <div
          className="voice-agent__meter-track"
          role="meter"
          aria-label="Microphone input level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={levelPercent}
        >
          <div
            className="voice-agent__meter-fill"
            style={{ width: `${levelPercent}%` }}
            data-testid="voice-level-fill"
          />
        </div>
      </div>

      <dl className="voice-agent__meta">
        <div>
          <dt>Language</dt>
          <dd data-testid="voice-language">{formatSessionLanguage(status.language)}</dd>
        </div>
        <div>
          <dt>Call ID</dt>
          <dd data-testid="voice-call-id">{status.callId ?? "—"}</dd>
        </div>
        <div>
          <dt>Conversation ID</dt>
          <dd data-testid="voice-conversation-id">{status.conversationId ?? "—"}</dd>
        </div>
        <div>
          <dt>Est. cost (call)</dt>
          <dd data-testid="voice-session-cost">{formatUsd(status.sessionEstimatedUsd)}</dd>
        </div>
        {status.errorCode ? (
          <div>
            <dt>Error code</dt>
            <dd data-testid="voice-error-code">{status.errorCode}</dd>
          </div>
        ) : null}
      </dl>

      <div className="voice-agent__pipeline" data-testid="voice-pipeline-logs">
        <h3 className="voice-agent__transcript-title">Pipeline logs</h3>
        {!pipeline || pipeline.stages.length === 0 ? (
          <p className="voice-agent__empty" data-testid="voice-pipeline-empty">
            Stage timings appear here after each successful voice turn.
          </p>
        ) : (
          <>
            <p className="voice-agent__pipeline-request" data-testid="voice-pipeline-request-id">
              requestId: {pipeline.requestId}
            </p>
            {lastCost ? (
              <p className="voice-agent__pipeline-request" data-testid="voice-turn-cost">
                Last turn est. {formatUsd(lastCost.estimatedUsd)}
                {lastCost.breakdown.length > 0
                  ? ` (${lastCost.breakdown
                      .map((b) => `${b.stage.toUpperCase()} ${formatUsd(b.estimatedUsd)}`)
                      .join(" · ")})`
                  : ""}
              </p>
            ) : null}
            <ul className="voice-agent__pipeline-stages">
              {pipeline.stages.map((stage) => (
                <li
                  key={`${pipeline.requestId}-${stage.stage}-${stage.outcome}-${stage.durationMs}`}
                  className={
                    stage.outcome === "failure"
                      ? "voice-agent__pipeline-stage voice-agent__pipeline-stage--fail"
                      : "voice-agent__pipeline-stage"
                  }
                  data-testid="voice-pipeline-stage"
                >
                  {formatStage(stage)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="voice-agent__transcript" data-testid="voice-transcript">
        <h3 className="voice-agent__transcript-title">Conversation</h3>
        {status.turns.length === 0 ? (
          <p className="voice-agent__empty" data-testid="voice-transcript-empty">
            Turns appear here after each successful voice response.
          </p>
        ) : (
          <ol className="voice-agent__turns">
            {status.turns.map((turn) => (
              <li key={turn.id} className="voice-agent__turn" data-testid="voice-turn">
                <p>
                  <span className="voice-agent__role">You</span>{" "}
                  <span data-testid="voice-turn-transcript">{turn.transcript}</span>
                </p>
                <p>
                  <span className="voice-agent__role">Agent</span>{" "}
                  <span data-testid="voice-turn-reply">{turn.replyText}</span>
                </p>
                {turn.cost ? (
                  <p className="voice-agent__notice" data-testid="voice-turn-cost-line">
                    Est. {formatUsd(turn.cost.estimatedUsd)}
                  </p>
                ) : null}
                {turn.ttsNotice ? (
                  <p className="voice-agent__notice" data-testid="voice-tts-notice">
                    {turn.ttsNotice}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
