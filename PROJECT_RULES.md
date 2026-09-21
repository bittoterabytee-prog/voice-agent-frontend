# Project Rules

Rules for humans and AI agents working on the **AI Voice Agent Frontend** repository.

1. **Backend is the source of truth for appointment availability, call records, and conversation state.** The UI must display API data — never invent slots, bookings, or call outcomes.
2. **AI must never invent appointment availability** in UI copy, mocks shipped as “live”, or client-side logic that pretends slots exist without a backend response.
3. **AI must never claim an appointment was booked** in the UI unless a booking API confirms success.
4. **Do not implement voice STT/TTS or conversation state machines in this repo** unless a ticket explicitly moves that ownership here. Prefer the backend `voice-agent` repository.
5. **Medical diagnosis is outside the scope of the product.** Dashboard copy and future agent surfaces must not provide diagnosis.
6. **Never expose API keys or secrets.** Do not commit `.env`, PATs, or credentials. Vite may only expose public `VITE_*` values.
7. **Do not put secrets in documentation or MCP prompts.** Use placeholders such as `YOUR_GITHUB_PAT`.
8. **External HTTP access must go through `src/services/`** (e.g. `apiClient.ts`). Do not scatter raw `fetch` calls with hard-coded base URLs across components.
9. **Configuration is env-driven.** Backend URL comes from `VITE_API_BASE_URL` (see `.env.example`). Do not require source edits to point at another API host.
10. **All new UI features must include test scenarios** under `tests/` (component or unit).
11. **Preserve the dashboard shell structure** (layout, nav, panels) when adding features; prefer extending pages/services over one-off pages outside routing.
12. **When architectural behavior changes**, update matching docs under `docs/` and root `ARCHITECTURE.md` / `SYSTEM_FLOW.md` / `PROJECT_RULES.md`.
13. **MCP GitHub access is read-only by default.** Do not enable write toolsets unless explicitly approved.
14. **Handle backend unavailability gracefully.** System Status and future data views must show error/loading states — never crash the shell.
15. **Jira, branch, and PR workflow (required for all ticket work):**
    - Before starting work, **ask for the Jira ticket number** if it is not already provided; if it is known, use it.
    - Create a branch from `main` with one of: `feat/{title}`, `fix/{title}`, or `bugfix/{title}`.
    - Preferred full form: `{prefix}/{JIRA-KEY}-{short-kebab-title}` (e.g. `feat/KAN-9-project-knowledge-docs`, `fix/KAN-12-status-error-state`, `bugfix/KAN-15-history-crash`).
    - When pushing ticket work, push the feature branch and **open a pull request** (do not land ticket work by pushing straight to `main`).
    - PR title should include the ticket key; PR body should summarize changes, list a short test plan, and link the Jira issue.

See also: [`docs/`](docs/), [`ARCHITECTURE.md`](ARCHITECTURE.md), [`SYSTEM_FLOW.md`](SYSTEM_FLOW.md), [`docs/mcp/MCP_SETUP.md`](docs/mcp/MCP_SETUP.md), [`.cursor/rules/git-jira-pr-workflow.mdc`](.cursor/rules/git-jira-pr-workflow.mdc).
