import { StatusBadge } from "@/components/StatusBadge";
import { useMicrophoneCapture } from "@/hooks/useMicrophoneCapture";
import type { MicrophoneCaptureState } from "@/types";

function badgeState(
  state: MicrophoneCaptureState,
): "idle" | "loading" | "healthy" | "error" {
  switch (state) {
    case "capturing":
      return "healthy";
    case "starting":
      return "loading";
    case "error":
      return "error";
    default:
      return "idle";
  }
}

function badgeLabel(state: MicrophoneCaptureState): string {
  switch (state) {
    case "capturing":
      return "Capturing";
    case "starting":
      return "Starting";
    case "error":
      return "Error";
    default:
      return "Idle";
  }
}

export function MicrophoneCapturePanel() {
  const { status, start, stop } = useMicrophoneCapture();
  const isBusy = status.state === "starting";
  const isCapturing = status.state === "capturing";
  const levelPercent = Math.round(status.level * 100);

  return (
    <div className="mic-capture" data-testid="mic-capture">
      <div className="mic-capture__row">
        <StatusBadge state={badgeState(status.state)} label={badgeLabel(status.state)} />
        <div className="mic-capture__actions">
          <button
            type="button"
            className="button"
            data-testid="mic-start"
            onClick={() => void start()}
            disabled={isBusy || isCapturing}
          >
            Start
          </button>
          <button
            type="button"
            className="button button--ghost"
            data-testid="mic-stop"
            onClick={stop}
            disabled={!isCapturing && status.state !== "starting"}
          >
            Stop
          </button>
        </div>
      </div>

      <p className="mic-capture__message" data-testid="mic-capture-message">
        {status.message}
      </p>

      <div className="mic-capture__meter" data-testid="mic-level-meter">
        <div className="mic-capture__meter-label">
          <span>Input level</span>
          <span data-testid="mic-level-value">{levelPercent}%</span>
        </div>
        <div
          className="mic-capture__meter-track"
          role="meter"
          aria-label="Microphone input level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={levelPercent}
        >
          <div
            className="mic-capture__meter-fill"
            style={{ width: `${levelPercent}%` }}
            data-testid="mic-level-fill"
          />
        </div>
      </div>

      <dl className="mic-capture__meta">
        <div>
          <dt>Chunks produced</dt>
          <dd data-testid="mic-chunk-count">{status.chunkCount}</dd>
        </div>
        <div>
          <dt>Last chunk</dt>
          <dd data-testid="mic-last-chunk">
            {status.lastChunk
              ? `#${status.lastChunk.sequence} · ${status.lastChunk.sampleCount} samples @ ${status.lastChunk.sampleRate} Hz (${status.lastChunk.format})`
              : "—"}
          </dd>
        </div>
        {status.errorCode ? (
          <div>
            <dt>Error code</dt>
            <dd data-testid="mic-error-code">{status.errorCode}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
