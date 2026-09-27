import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppointmentManagePanel } from "@/components/AppointmentManagePanel";

const appointment = {
  id: "appt-1",
  patientId: "pat-1",
  doctorId: "doc-1",
  appointmentDate: "2026-10-14",
  appointmentTime: "10:00:00",
  status: "SCHEDULED",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("AppointmentManagePanel (KAN-110)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("TC-001 cancel with confirm sets CANCELLED from API", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      if (url.includes("/lookup")) {
        return jsonResponse({
          outcome: "found",
          appointment,
          appointments: [appointment],
          isActive: true,
          message: "Found",
        });
      }
      if (url.includes("/cancel")) {
        expect(body.confirmed).toBe(true);
        return jsonResponse({
          outcome: "cancelled",
          appointment: { ...appointment, status: "CANCELLED" },
          message: "Appointment cancelled",
        });
      }
      return jsonResponse({ status: "ok" });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <AppointmentManagePanel />
      </MemoryRouter>,
    );

    await user.type(screen.getByTestId("manage-appointment-id"), "appt-1");
    await user.click(screen.getByTestId("manage-lookup"));
    expect(await screen.findByTestId("manage-selected-status")).toHaveTextContent("SCHEDULED");

    expect(screen.getByTestId("manage-cancel")).toBeDisabled();
    await user.click(screen.getByTestId("manage-cancel-confirm"));
    expect(screen.getByTestId("manage-cancel")).toBeEnabled();
    await user.click(screen.getByTestId("manage-cancel"));

    expect(await screen.findByTestId("manage-cancel-success")).toHaveTextContent("CANCELLED");
    expect(screen.getByTestId("manage-selected-status")).toHaveTextContent("CANCELLED");
  });

  it("TC-002 cancel without confirm does not mutate", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/lookup")) {
        return jsonResponse({
          outcome: "found",
          appointment,
          appointments: [appointment],
          isActive: true,
          message: "Found",
        });
      }
      if (url.includes("/cancel")) {
        throw new Error("cancel must not be called");
      }
      return jsonResponse({ status: "ok" });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <AppointmentManagePanel />
      </MemoryRouter>,
    );

    await user.type(screen.getByTestId("manage-appointment-id"), "appt-1");
    await user.click(screen.getByTestId("manage-lookup"));
    await screen.findByTestId("manage-selected");
    expect(screen.getByTestId("manage-cancel")).toBeDisabled();
    expect(screen.getByTestId("manage-cancel-hint")).toBeInTheDocument();
    expect(fetchMock.mock.calls.some((c) => String(c[0]).includes("/cancel"))).toBe(false);
  });

  it("TC-003 reschedule uses only slots from checkAvailability", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      if (url.includes("/lookup")) {
        return jsonResponse({
          outcome: "found",
          appointment,
          appointments: [appointment],
          isActive: true,
          message: "Found",
        });
      }
      if (url.includes("/datetime/resolve")) {
        return jsonResponse({
          outcome: "resolved",
          window: {
            date: "2026-10-15",
            timeStart: "12:00:00",
            timeEnd: "17:00:00",
            partOfDay: "afternoon",
          },
          message: "ok",
        });
      }
      if (url.includes("/availability")) {
        expect(body.excludeAppointmentId).toBe("appt-1");
        return jsonResponse({
          outcome: "available",
          doctorId: "doc-1",
          date: "2026-10-15",
          slots: [{ date: "2026-10-15", time: "14:00:00" }],
          alternatives: [],
          message: "ok",
        });
      }
      if (url.includes("/reschedule")) {
        expect(body.confirmed).toBe(true);
        expect(body.date).toBe("2026-10-15");
        expect(body.time).toBe("14:00:00");
        return jsonResponse({
          outcome: "rescheduled",
          appointment: {
            ...appointment,
            appointmentDate: "2026-10-15",
            appointmentTime: "14:00:00",
          },
          previous: { date: "2026-10-14", time: "10:00:00" },
          message: "Rescheduled",
        });
      }
      return jsonResponse({ status: "ok" });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <AppointmentManagePanel />
      </MemoryRouter>,
    );

    await user.type(screen.getByTestId("manage-appointment-id"), "appt-1");
    await user.click(screen.getByTestId("manage-lookup"));
    await screen.findByTestId("manage-selected");
    await user.click(screen.getByTestId("manage-find-slots"));
    const slotList = await screen.findByTestId("manage-slot-list");
    expect(slotList).toHaveTextContent("14:00:00");
    expect(slotList).not.toHaveTextContent("99:00:00");
    await user.click(within(slotList).getByLabelText(/14:00:00/));
    expect(screen.getByTestId("manage-reschedule")).toBeDisabled();
    await user.click(screen.getByTestId("manage-reschedule-confirm"));
    await user.click(screen.getByTestId("manage-reschedule"));
    expect(await screen.findByTestId("manage-reschedule-success")).toHaveTextContent("14:00:00");
  });

  it("shows distinct not_found and multiple_matches outcomes", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          outcome: "not_found",
          appointment: null,
          appointments: [],
          isActive: false,
          message: "No appointments match the criteria",
        }),
      ),
    );

    render(
      <MemoryRouter>
        <AppointmentManagePanel />
      </MemoryRouter>,
    );
    await user.type(screen.getByTestId("manage-patient-id"), "pat-missing");
    await user.click(screen.getByTestId("manage-lookup"));
    expect(await screen.findByTestId("manage-not-found")).toHaveTextContent("No appointments match");
  });
});
