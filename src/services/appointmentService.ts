/**
 * Typed clients for Sprint 4 appointment HTTP APIs (KAN-108).
 * Backend is source of truth — never invent slots or claim booking success locally.
 */
import { apiPost } from "./apiClient";
import type {
  BookAppointmentInput,
  BookAppointmentResult,
  CancelAppointmentInput,
  CancelAppointmentResult,
  CheckAvailabilityInput,
  CheckAvailabilityResult,
  GetAppointmentInput,
  GetAppointmentResult,
  IdentifyPatientInput,
  IdentifyPatientResult,
  RescheduleAppointmentInput,
  RescheduleAppointmentResult,
  ResolveDateTimeInput,
  ResolveDateTimeResult,
  SearchDoctorInput,
  SearchDoctorResult,
} from "@/types/appointments";

const BASE = "/api/appointments";

export async function identifyPatient(
  input: IdentifyPatientInput = {},
): Promise<IdentifyPatientResult> {
  return apiPost<IdentifyPatientResult>(`${BASE}/patients/identify`, input);
}

export async function searchDoctor(input: SearchDoctorInput = {}): Promise<SearchDoctorResult> {
  return apiPost<SearchDoctorResult>(`${BASE}/doctors/search`, input);
}

export async function resolveDateTime(input: ResolveDateTimeInput): Promise<ResolveDateTimeResult> {
  return apiPost<ResolveDateTimeResult>(`${BASE}/datetime/resolve`, input);
}

export async function checkAvailability(
  input: CheckAvailabilityInput,
): Promise<CheckAvailabilityResult> {
  return apiPost<CheckAvailabilityResult>(`${BASE}/availability`, input);
}

export async function lookupAppointment(
  input: GetAppointmentInput = {},
): Promise<GetAppointmentResult> {
  return apiPost<GetAppointmentResult>(`${BASE}/lookup`, input);
}

export async function bookAppointment(input: BookAppointmentInput): Promise<BookAppointmentResult> {
  return apiPost<BookAppointmentResult>(`${BASE}/book`, input);
}

export async function cancelAppointment(
  input: CancelAppointmentInput,
): Promise<CancelAppointmentResult> {
  return apiPost<CancelAppointmentResult>(`${BASE}/cancel`, input);
}

export async function rescheduleAppointment(
  input: RescheduleAppointmentInput,
): Promise<RescheduleAppointmentResult> {
  return apiPost<RescheduleAppointmentResult>(`${BASE}/reschedule`, input);
}
