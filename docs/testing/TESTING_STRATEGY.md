# Testing Strategy (Frontend)

## Tooling

- **Vitest** + **jsdom**
- **Testing Library** + **user-event**
- Setup: `tests/setup.ts`

## What we test today

| Area | File | Covers |
| ---- | ---- | ------ |
| Dashboard load + nav | `tests/App.test.tsx` | TC-002, TC-003 style routes |
| Health success / failure | `tests/App.test.tsx` | System Status healthy vs unavailable |
| API base URL | `tests/App.test.tsx`, `tests/apiClient.test.ts` | Env-driven URL |
| Network errors | `tests/apiClient.test.ts` | `ApiError` wrapping |

## Expectations for new work

1. **Before changing code**, review related existing tests under `tests/`.
2. **Add or extend tests** for every product change (routes, services, UI behavior, bug fixes). Same change set as the code.
3. Mock `fetch` — do not hit a real backend in unit/component tests.
4. Prefer `data-testid` hooks already used (`dashboard-page`, `system-status`, etc.).
5. Run `npm test` (and keep lint/format/build green: `npm run lint`, `npm run build`).
6. **Update knowledge** when behavior or coverage changes: this file, plus matching `docs/**` / root architecture docs / `PROJECT_RULES.md` as needed. See [`.cursor/rules/tests-and-knowledge.mdc`](../../.cursor/rules/tests-and-knowledge.mdc).

## Manual checks

- `npm run dev` loads without compile errors.
- With backend down, System Status shows Unavailable.
- With backend up on `VITE_API_BASE_URL`, status shows Healthy.
- Resize viewport: sidebar collapses behind Menu on narrow screens.
