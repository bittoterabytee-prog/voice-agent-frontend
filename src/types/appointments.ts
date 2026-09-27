/** Appointment HTTP types aligned with voice-agent `/api/appointments/*` (KAN-108 / KAN-72). */

export type WorkingHours = Record<string, { start: string; end: string }>;

export type DoctorAvailabilityStatus = "AVAILABLE" | "ON_LEAVE" | "UNAVAILABLE";

export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";

export type Patient = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  department: string;
  gender: string | null;
  availabilityStatus: DoctorAvailabilityStatus;
  workingHours: WorkingHours;
  createdAt: string;
  updatedAt: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type PartOfDay = "morning" | "afternoon" | "evening" | "any";

export type ResolvedTimeWindow = {
  date: string;
  timeStart: string;
  timeEnd: string;
  partOfDay: PartOfDay;
};

export type AvailabilitySlot = {
  date: string;
  time: string;
};

export type IdentifyPatientInput = {
  phone?: string;
  name?: string;
  preferredLanguage?: string;
};

export type IdentifyPatientResult =
  | { outcome: "found"; patient: Patient; patients: Patient[]; message: string }
  | { outcome: "multiple_matches"; patient: null; patients: Patient[]; message: string }
  | { outcome: "needs_name"; patient: null; patients: []; message: string }
  | { outcome: "registered"; patient: Patient; patients: Patient[]; message: string };

export type SearchDoctorInput = {
  name?: string;
  specialization?: string;
  specialty?: string;
  department?: string;
  gender?: string;
};

export type SearchDoctorResult =
  | { outcome: "found"; doctor: Doctor; doctors: Doctor[]; message: string }
  | { outcome: "multiple_matches"; doctor: null; doctors: Doctor[]; message: string }
  | { outcome: "not_found"; doctor: null; doctors: []; message: string }
  | { outcome: "unavailable"; doctor: null; doctors: Doctor[]; message: string };

export type ResolveDateTimeInput = {
  phrase: string;
};

export type ResolveDateTimeResult =
  | { outcome: "resolved"; window: ResolvedTimeWindow; message: string }
  | { outcome: "ambiguous"; window: null; message: string };

export type CheckAvailabilityInput = {
  doctorId: string;
  window: ResolvedTimeWindow;
  slotMinutes?: number;
  callId?: string;
  excludeAppointmentId?: string;
};

export type CheckAvailabilityResult = {
  outcome: "available" | "empty" | "unavailable";
  doctorId: string;
  date: string;
  slots: AvailabilitySlot[];
  alternatives: AvailabilitySlot[];
  message: string;
};

export type GetAppointmentInput = {
  appointmentId?: string;
  patientId?: string;
  doctorId?: string;
  appointmentDate?: string;
  statuses?: AppointmentStatus[];
};

export type GetAppointmentResult =
  | {
      outcome: "found";
      appointment: Appointment;
      appointments: Appointment[];
      isActive: boolean;
      message: string;
    }
  | {
      outcome: "not_found";
      appointment: null;
      appointments: [];
      isActive: false;
      message: string;
    }
  | {
      outcome: "multiple_matches";
      appointment: null;
      appointments: Appointment[];
      isActive: false;
      message: string;
    };

export type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  /** Must be `true` for the backend to persist a booking. */
  confirmed?: boolean;
  slotMinutes?: number;
  callId?: string;
};

export type BookAppointmentConfirmation = {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
};

export type BookAppointmentResult =
  | {
      outcome: "booked";
      appointment: Appointment;
      patient: Patient;
      doctor: Doctor;
      confirmation: BookAppointmentConfirmation;
      message: string;
    }
  | {
      outcome: "needs_confirmation";
      appointment: null;
      confirmation: null;
      message: string;
    }
  | {
      outcome: "slot_unavailable";
      appointment: null;
      confirmation: null;
      message: string;
    }
  | {
      outcome: "failed";
      appointment: null;
      confirmation: null;
      message: string;
    };

export type CancelAppointmentInput = {
  patientId: string;
  appointmentId?: string;
  doctorId?: string;
  appointmentDate?: string;
  confirmed?: boolean;
  callId?: string;
};

export type CancelAppointmentResult =
  | { outcome: "cancelled"; appointment: Appointment; message: string }
  | { outcome: "needs_confirmation"; appointment: Appointment | null; message: string }
  | { outcome: "not_found"; appointment: null; message: string }
  | {
      outcome: "multiple_matches";
      appointment: null;
      appointments: Appointment[];
      message: string;
    }
  | { outcome: "already_cancelled"; appointment: Appointment; message: string }
  | { outcome: "not_permitted"; appointment: Appointment | null; message: string }
  | { outcome: "failed"; appointment: null; message: string };

export type RescheduleAppointmentInput = {
  appointmentId: string;
  patientId: string;
  date: string;
  time: string;
  confirmed?: boolean;
  latestRequestedDate?: string;
  latestRequestedTime?: string;
  slotMinutes?: number;
  callId?: string;
};

export type RescheduleAppointmentResult =
  | {
      outcome: "rescheduled";
      appointment: Appointment;
      previous: { date: string; time: string };
      message: string;
    }
  | { outcome: "needs_confirmation"; appointment: Appointment | null; message: string }
  | { outcome: "not_found"; appointment: null; message: string }
  | { outcome: "not_permitted"; appointment: Appointment | null; message: string }
  | { outcome: "slot_unavailable"; appointment: Appointment; message: string }
  | { outcome: "stale_candidate"; appointment: Appointment; message: string }
  | { outcome: "failed"; appointment: Appointment | null; message: string };

/** True only when the backend confirmed a persisted booking. */
export function isBookedOutcome(
  result: BookAppointmentResult,
): result is Extract<BookAppointmentResult, { outcome: "booked" }> {
  return result.outcome === "booked" && result.confirmation != null;
}

export function isCancelledOutcome(
  result: CancelAppointmentResult,
): result is Extract<CancelAppointmentResult, { outcome: "cancelled" }> {
  return result.outcome === "cancelled";
}

export function isRescheduledOutcome(
  result: RescheduleAppointmentResult,
): result is Extract<RescheduleAppointmentResult, { outcome: "rescheduled" }> {
  return result.outcome === "rescheduled";
}
