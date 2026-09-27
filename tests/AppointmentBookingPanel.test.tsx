import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppointmentBookingPanel } from "@/components/AppointmentBookingPanel";
import { App } from "@/app/App";

const doctor = {
  id: "doc-1",
  name: "Dr. Test",
  specialization: "Cardiology",
  department: "Cardio",
  gender: null,
  availabilityStatus: "AVAILABLE",
  workingHours: {},
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const patient = {
  id: "pat-1",
  name: "Ada Lovelace",
  phone: "+1555099109",
  email: null,
  preferredLanguage: "en",
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

describe("AppointmentBookingPanel (KAN-109)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("TC-001 happy path book with confirmation shows appointment id from API", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      if (url.includes("/patients/identify")) {
        return jsonResponse({
          outcome: "registered",
          patient,
          patients: [patient],
          message: "Registered",
        });
      }
      if (url.includes("/doctors/search")) {
        return jsonResponse({
          outcome: "found",
          doctor,
          doctors: [doctor],
          message: "1 doctor",
        });
      }
      if (url.includes("/datetime/resolve")) {
        return jsonResponse({
          outcome: "resolved",
          window: {
            date: "2026-09-28",
            timeStart: "09:00:00",
            timeEnd: "12:00:00",
            partOfDay: "morning",
          },
          message: "Resolved",
        });
      }
      if (url.includes("/availability")) {
        return jsonResponse({
          outcome: "available",
          doctorId: doctor.id,
          date: "2026-09-28",
          slots: [{ date: "2026-09-28", time: "10:00:00" }],
          alternatives: [],
          message: "Open slots",
        });
      }
      if (url.includes("/book")) {
        expect(body.confirmed).toBe(true);
        return jsonResponse({
          outcome: "booked",
          appointment: { id: "appt-1", patientId: patient.id, doctorId: doctor.id },
          patient,
          doctor,
          confirmation: {
            appointmentId: "appt-99",
            patientId: patient.id,
            doctorId: doctor.id,
            doctorName: doctor.name,
            date: "2026-09-28",
            time: "10:00:00",
            status: "SCHEDULED",
          },
          message: "Booked",
        });
      }
      return jsonResponse({ status: "ok" });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <AppointmentBookingPanel />
      </MemoryRouter>,
    );

    await user.type(screen.getByTestId("booking-phone"), "+1555099109");
    await user.type(screen.getByTestId("booking-name"), "Ada Lovelace");
    await user.click(screen.getByTestId("booking-identify"));
    expect(await screen.findByTestId("booking-patient")).toHaveTextContent("Ada Lovelace");

    await user.click(screen.getByTestId("booking-search-doctors"));
    expect(await screen.findByTestId("booking-doctor-list")).toHaveTextContent("Dr. Test");

    await user.click(screen.getByTestId("booking-check-availability"));
    const slotList = await screen.findByTestId("booking-slot-list");
    await user.click(within(slotList).getByLabelText(/2026-09-28 at 10:00:00/));

    expect(screen.getByTestId("booking-submit")).toBeDisabled();
    await user.click(screen.getByTestId("booking-confirm"));
    expect(screen.getByTestId("booking-submit")).toBeEnabled();
    await user.click(screen.getByTestId("booking-submit"));

    expect(await screen.findByTestId("booking-appointment-id")).toHaveTextContent("appt-99");
    expect(screen.getByTestId("booking-success")).toHaveTextContent("Dr. Test");
  });

  it("TC-002 Book stays disabled without confirmation", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/patients/identify")) {
          return jsonResponse({
            outcome: "found",
            patient,
            patients: [patient],
            message: "Found",
          });
        }
        if (url.includes("/doctors/search")) {
          return jsonResponse({
            outcome: "found",
            doctor,
            doctors: [doctor],
            message: "1",
          });
        }
        if (url.includes("/datetime/resolve")) {
          return jsonResponse({
            outcome: "resolved",
            window: {
              date: "2026-09-28",
              timeStart: "09:00:00",
              timeEnd: "12:00:00",
              partOfDay: "morning",
            },
            message: "ok",
          });
        }
        if (url.includes("/availability")) {
          return jsonResponse({
            outcome: "available",
            doctorId: doctor.id,
            date: "2026-09-28",
            slots: [{ date: "2026-09-28", time: "10:00:00" }],
            alternatives: [],
            message: "ok",
          });
        }
        return jsonResponse({ status: "ok" });
      }),
    );

    render(
      <MemoryRouter>
        <AppointmentBookingPanel />
      </MemoryRouter>,
    );

    await user.type(screen.getByTestId("booking-phone"), "+1");
    await user.type(screen.getByTestId("booking-name"), "Ada");
    await user.click(screen.getByTestId("booking-identify"));
    await screen.findByTestId("booking-patient");
    await user.click(screen.getByTestId("booking-search-doctors"));
    await screen.findByTestId("booking-doctor-list");
    await user.click(screen.getByTestId("booking-check-availability"));
    const slotList = await screen.findByTestId("booking-slot-list");
    await user.click(within(slotList).getByLabelText(/10:00:00/));

    expect(screen.getByTestId("booking-submit")).toBeDisabled();
    expect(screen.getByTestId("booking-confirm-hint")).toBeInTheDocument();
  });

  it("TC-003 empty availability does not invent slots or allow book", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/patients/identify")) {
          return jsonResponse({
            outcome: "found",
            patient,
            patients: [patient],
            message: "Found",
          });
        }
        if (url.includes("/doctors/search")) {
          return jsonResponse({
            outcome: "found",
            doctor,
            doctors: [doctor],
            message: "1",
          });
        }
        if (url.includes("/datetime/resolve")) {
          return jsonResponse({
            outcome: "resolved",
            window: {
              date: "2026-09-28",
              timeStart: "09:00:00",
              timeEnd: "12:00:00",
              partOfDay: "morning",
            },
            message: "ok",
          });
        }
        if (url.includes("/availability")) {
          return jsonResponse({
            outcome: "empty",
            doctorId: doctor.id,
            date: "2026-09-28",
            slots: [],
            alternatives: [],
            message: "No open slots in that window",
          });
        }
        return jsonResponse({ status: "ok" });
      }),
    );

    render(
      <MemoryRouter>
        <AppointmentBookingPanel />
      </MemoryRouter>,
    );

    await user.type(screen.getByTestId("booking-phone"), "+1");
    await user.type(screen.getByTestId("booking-name"), "Ada");
    await user.click(screen.getByTestId("booking-identify"));
    await screen.findByTestId("booking-patient");
    await user.click(screen.getByTestId("booking-search-doctors"));
    await screen.findByTestId("booking-doctor-list");
    await user.click(screen.getByTestId("booking-check-availability"));

    expect(await screen.findByTestId("booking-slots-empty")).toHaveTextContent(
      "No open slots in that window",
    );
    expect(screen.queryByTestId("booking-slot-list")).not.toBeInTheDocument();
    expect(screen.getByTestId("booking-submit")).toBeDisabled();
  });
});

describe("Appointments route (KAN-109)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("nav exposes Appointments page", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: "ok" })),
    );
    render(<App />);
    await user.click(screen.getByRole("link", { name: "Appointments" }));
    expect(await screen.findByTestId("appointments-page")).toBeInTheDocument();
    expect(screen.getByTestId("appointment-booking")).toBeInTheDocument();
  });
});
