import { useCallback, useEffect, useState } from "react";
import { Panel } from "@/components/Panel";
import { ApiError, getApiBaseUrl } from "@/services/apiClient";
import { fetchSpendSummary } from "@/services/usageService";
import type { SpendSummary } from "@/types";
import { formatUsd } from "@/utils/formatUsd";

export function SettingsPage() {
  const [spend, setSpend] = useState<SpendSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSpend = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await fetchSpendSummary();
      setSpend(summary);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to load POC spend summary from the backend.";
      setError(message);
      setSpend(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSpend();
  }, [refreshSpend]);

  return (
    <div className="page" data-testid="settings-page">
      <div className="page__intro">
        <h2>Settings</h2>
        <p>Environment-driven configuration and estimated OpenAI spend for this POC.</p>
      </div>
      <Panel title="API Configuration">
        <dl className="settings-list">
          <div>
            <dt>VITE_API_BASE_URL</dt>
            <dd data-testid="settings-api-url">{getApiBaseUrl()}</dd>
          </div>
        </dl>
        <p className="placeholder">
          Change the backend URL in <code>.env</code> and restart the dev server. No source changes
          are required.
        </p>
      </Panel>

      <Panel
        title="POC spend so far"
        actions={
          <button type="button" className="button button--ghost" onClick={() => void refreshSpend()}>
            Refresh
          </button>
        }
      >
        {loading ? <p className="placeholder">Loading spend summary…</p> : null}
        {error ? (
          <p className="placeholder" data-testid="settings-spend-error">
            {error}
          </p>
        ) : null}
        {!loading && !error && spend ? (
          <>
            <dl className="settings-list" data-testid="settings-spend-summary">
              <div>
                <dt>Estimated total</dt>
                <dd data-testid="settings-spend-total">{formatUsd(spend.estimatedUsdTotal)}</dd>
              </div>
              <div>
                <dt>Tracked turns</dt>
                <dd data-testid="settings-spend-turns">{spend.turnCount}</dd>
              </div>
              <div>
                <dt>Recent calls scanned</dt>
                <dd data-testid="settings-spend-calls">{spend.callCount}</dd>
              </div>
            </dl>
            <p className="placeholder" data-testid="settings-spend-note">
              {spend.note}{" "}
              <a
                href="https://platform.openai.com/settings/organization/billing/overview"
                target="_blank"
                rel="noreferrer"
              >
                OpenAI billing overview
              </a>
            </p>
          </>
        ) : null}
      </Panel>
    </div>
  );
}
