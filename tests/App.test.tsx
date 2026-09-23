import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/app/App";

describe("dashboard foundation", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Promise.resolve({
          ok: true,
          json: async () => ({ status: "ok" }),
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("TC-002 displays the dashboard page on load", async () => {
    render(<App />);

    expect(await screen.findByTestId("dashboard-page")).toBeInTheDocument();
    expect(screen.getByTestId("live-call-monitor")).toBeInTheDocument();
    expect(screen.getByText("Active call")).toBeInTheDocument();
    expect(screen.getByText("System Status")).toBeInTheDocument();
  });

  it("KAN-19 shows SRD live-call fields and voice states on dashboard", async () => {
    render(<App />);

    expect(await screen.findByTestId("live-call-monitor")).toBeInTheDocument();
    expect(screen.getByTestId("live-call-state")).toHaveTextContent("WAITING FOR USER");
    expect(screen.getAllByText("Hinglish").length).toBeGreaterThan(0);
    expect(screen.getAllByText("BOOK_APPOINTMENT").length).toBeGreaterThan(0);
    expect(screen.getByTestId("call-activity-timeline")).toBeInTheDocument();
    expect(screen.getByText(/State → WAITING_FOR_USER/)).toBeInTheDocument();
    expect(screen.getByTestId("voice-state-legend")).toBeInTheDocument();
    expect(screen.getByText("Listening")).toBeInTheDocument();
    expect(screen.getAllByText("Processing").length).toBeGreaterThan(0);
    expect(screen.getByText("Speaking")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getAllByText("Idle / waiting").length).toBeGreaterThan(0);
  });

  it("KAN-17 voice agent panel is available on Calls", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "Calls" }));
    expect(await screen.findByTestId("calls-page")).toBeInTheDocument();
    expect(screen.getByTestId("voice-agent")).toBeInTheDocument();
    expect(screen.getByTestId("voice-start")).toBeInTheDocument();
    expect(screen.getByTestId("mic-capture")).toBeInTheDocument();
  });

  it("KAN-19 call history lists demo appointment sessions", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "Call History" }));
    expect(await screen.findByTestId("history-page")).toBeInTheDocument();
    expect(screen.getByTestId("recent-calls-table")).toBeInTheDocument();
    expect(screen.getByText(/Booked — Dr. Mehta/)).toBeInTheDocument();
    expect(screen.getByText(/Human handoff/)).toBeInTheDocument();
  });

  it("TC-003 navigates between primary routes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "Calls" }));
    expect(await screen.findByTestId("calls-page")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Call History" }));
    expect(await screen.findByTestId("history-page")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByTestId("settings-page")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Dashboard" }));
    expect(await screen.findByTestId("dashboard-page")).toBeInTheDocument();
  });

  it("TC-004 handles a healthy backend response", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("system-status-message")).toHaveTextContent(
        'Backend reported status "ok".',
      );
    });
    expect(screen.getByTestId("status-badge")).toHaveTextContent("Healthy");
  });

  it("TC-005 shows an error state when the backend is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("system-status-message")).toHaveTextContent(
        "Unable to reach the backend API",
      );
    });
    expect(screen.getByTestId("status-badge")).toHaveTextContent("Unavailable");
  });

  it("TC-006 uses the configured API base URL", async () => {
    render(<App />);

    expect(await screen.findByTestId("api-base-url")).toHaveTextContent("http://localhost:3000");
  });
});
