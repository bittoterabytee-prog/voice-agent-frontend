import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/apiClient";
import {
  bookAppointment,
  cancelAppointment,
  checkAvailability,
  identifyPatient,
  lookupAppointment,
  rescheduleAppointment,
  resolveDateTime,
  searchDoctor,
} from "@/services/appointmentService";
import { isBookedOutcome } from "@/types/appointments";

function mockOk(body: unknown, status = 200) {
  return vi.fn(async () =>
    Promise.resolve({
      ok: true,
      status,
      json: async () => body,
    }),
  );
}

function mockFail(status: number, code: string, message: string) {
  return vi.fn(async () =>
    Promise.resolve({
      ok: false,
      status,
      json: async () => ({ error: { code, message } }),
    }),
  );
}

describe("appointmentService (KAN-108)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("TC-001 searchDoctor returns doctors from the API body", async () => {
    const doctors = [
      {
        id: "doc-1",
        name: "Dr. Test",
        specialization: "Cardiology",
        department: "Cardio",
        gender: null,
        availabilityStatus: "AVAILABLE",
        workingHours: {},
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    const fetchMock = mockOk({
      outcome: "found",
      doctor: doctors[0],
      doctors,
      message: "1 doctor",
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchDoctor({ specialization: "Cardiology" });

    expect(result.outcome).toBe("found");
    expect(result.doctors).toEqual(doctors);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/appointments/doctors/search",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ specialization: "Cardiology" }),
      }),
    );
  });

  it("TC-002 maps 400 VALIDATION_ERROR without inventing success", async () => {
    vi.stubGlobal(
      "fetch",
      mockFail(400, "VALIDATION_ERROR", "patientId, doctorId, date, and time are required"),
    );

    await expect(
      bookAppointment({
        patientId: "",
        doctorId: "doc-1",
        date: "2026-10-14",
        time: "10:00:00",
        confirmed: true,
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      code: "VALIDATION_ERROR",
    });
  });

  it("posts identify / resolve / availability / lookup / cancel / reschedule paths", async () => {
    const fetchMock = mockOk({ outcome: "ok-placeholder" });
    vi.stubGlobal("fetch", fetchMock);

    await identifyPatient({ phone: "+15550001111", name: "Ada" });
    await resolveDateTime({ phrase: "tomorrow morning" });
    await checkAvailability({
      doctorId: "doc-1",
      window: {
        date: "2026-10-14",
        timeStart: "09:00:00",
        timeEnd: "12:00:00",
        partOfDay: "morning",
      },
    });
    await lookupAppointment({ appointmentId: "appt-1" });
    await cancelAppointment({ patientId: "p-1", appointmentId: "appt-1", confirmed: true });
    await rescheduleAppointment({
      appointmentId: "appt-1",
      patientId: "p-1",
      date: "2026-10-14",
      time: "11:00:00",
      confirmed: true,
    });

    const urls = fetchMock.mock.calls.map((call) => call[0] as string);
    expect(urls).toEqual([
      "http://localhost:3000/api/appointments/patients/identify",
      "http://localhost:3000/api/appointments/datetime/resolve",
      "http://localhost:3000/api/appointments/availability",
      "http://localhost:3000/api/appointments/lookup",
      "http://localhost:3000/api/appointments/cancel",
      "http://localhost:3000/api/appointments/reschedule",
    ]);
  });

  it("does not treat needs_confirmation as a booked success", async () => {
    vi.stubGlobal(
      "fetch",
      mockOk({
        outcome: "needs_confirmation",
        appointment: null,
        confirmation: null,
        message: "Confirm before booking",
      }),
    );

    const result = await bookAppointment({
      patientId: "p-1",
      doctorId: "doc-1",
      date: "2026-10-14",
      time: "10:00:00",
    });

    expect(result.outcome).toBe("needs_confirmation");
    expect(isBookedOutcome(result)).toBe(false);
  });

  it("isBookedOutcome is true only for confirmed booked payloads", async () => {
    vi.stubGlobal(
      "fetch",
      mockOk({
        outcome: "booked",
        appointment: { id: "a1" },
        confirmation: {
          appointmentId: "a1",
          patientId: "p1",
          doctorId: "d1",
          doctorName: "Dr",
          date: "2026-10-14",
          time: "10:00:00",
          status: "SCHEDULED",
        },
        message: "Booked",
      }),
    );

    const result = await bookAppointment({
      patientId: "p1",
      doctorId: "d1",
      date: "2026-10-14",
      time: "10:00:00",
      confirmed: true,
    });

    expect(isBookedOutcome(result)).toBe(true);
  });

  it("propagates ApiError on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    await expect(searchDoctor({})).rejects.toBeInstanceOf(ApiError);
  });
});
