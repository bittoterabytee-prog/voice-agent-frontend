import { Panel } from "@/components/Panel";
import { getApiBaseUrl } from "@/services/apiClient";

export function SettingsPage() {
  return (
    <div className="page" data-testid="settings-page">
      <div className="page__intro">
        <h2>Settings</h2>
        <p>Environment-driven configuration for the dashboard foundation.</p>
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
    </div>
  );
}
