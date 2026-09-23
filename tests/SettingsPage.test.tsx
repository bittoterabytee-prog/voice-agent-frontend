import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SettingsPage } from "@/pages/SettingsPage";
import type { SpendSummary } from "@/types";

const fetchSpendSummaryMock = vi.fn();

vi.mock("@/services/usageService", () => ({
  fetchSpendSummary: (...args: unknown[]) => fetchSpendSummaryMock(...args),
}));

const summary: SpendSummary = {
  currency: "USD",
  estimatedUsdTotal: 0.0042,
  turnCount: 3,
  callCount: 2,
  note: "Estimated POC spend from tracked OpenAI usage events; not a live OpenAI wallet balance.",
};

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={["/settings"]}>
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SettingsPage (POC spend)", () => {
  beforeEach(() => {
    fetchSpendSummaryMock.mockReset();
    fetchSpendSummaryMock.mockResolvedValue(summary);
  });

  it("loads estimated POC spend so far from /api/usage/summary", async () => {
    renderSettings();

    await waitFor(() => {
      expect(fetchSpendSummaryMock).toHaveBeenCalled();
      expect(screen.getByTestId("settings-spend-summary")).toBeInTheDocument();
      expect(screen.getByTestId("settings-spend-total")).toHaveTextContent("$0.0042");
      expect(screen.getByTestId("settings-spend-turns")).toHaveTextContent("3");
      expect(screen.getByTestId("settings-spend-calls")).toHaveTextContent("2");
      expect(screen.getByTestId("settings-spend-note")).toHaveTextContent(/not a live OpenAI wallet/i);
    });
  });
});
