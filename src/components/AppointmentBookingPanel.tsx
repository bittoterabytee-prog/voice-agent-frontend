import { useMemo, useState } from "react";
import { ApiError } from "@/services/apiClient";
import {
  bookAppointment,
  checkAvailability,
  identifyPatient,
  resolveDateTime,
  searchDoctor,
} from "@/services/appointmentService";
import type {
  AvailabilitySlot,
  BookAppointmentResult,
  CheckAvailabilityResult,
  Doctor,
  IdentifyPatientResult,
  Patient,
  ResolveDateTimeResult,
  SearchDoctorResult,
} from "@/types/appointments";
import { isBookedOutcome } from "@/types/appointments";

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  return "Request failed. Check that the backend is running.";
}

export function AppointmentBookingPanel() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [identifyNote, setIdentifyNote] = useState<string | null>(null);

  const [doctorQuery, setDoctorQuery] = useState({ specialization: "Cardiology", name: "" });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctorNote, setDoctorNote] = useState<string | null>(null);

  const [phrase, setPhrase] = useState("tomorrow morning");
  const [resolveResult, setResolveResult] = useState<ResolveDateTimeResult | null>(null);
  const [availability, setAvailability] = useState<CheckAvailabilityResult | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookResult, setBookResult] = useState<BookAppointmentResult | null>(null);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId) ?? null,
    [doctors, selectedDoctorId],
  );

  const slots = availability?.slots ?? [];
  const canBook = Boolean(patient && selectedDoctor && selectedSlot && confirmed && !busy);

  async function onIdentify() {
    setBusy("identify");
    setError(null);
    setIdentifyNote(null);
    setPatient(null);
    setBookResult(null);
    try {
      const result: IdentifyPatientResult = await identifyPatient({
        phone: phone.trim() || undefined,
        name: name.trim() || undefined,
      });
      setIdentifyNote(result.message);
      if (result.outcome === "found" || result.outcome === "registered") {
        setPatient(result.patient);
      } else if (result.outcome === "multiple_matches") {
        setError("Multiple patients match that phone. Enter the exact patient name and try again.");
      } else if (result.outcome === "needs_name") {
        setError(result.message);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function onSearchDoctors() {
    setBusy("search");
    setError(null);
    setDoctorNote(null);
    setDoctors([]);
    setSelectedDoctorId(null);
    setAvailability(null);
    setSelectedSlot(null);
    setBookResult(null);
    try {
      const result: SearchDoctorResult = await searchDoctor({
        specialization: doctorQuery.specialization.trim() || undefined,
        name: doctorQuery.name.trim() || undefined,
      });
      setDoctorNote(result.message);
      setDoctors(result.doctors);
      if (result.outcome === "found" && result.doctor) {
        setSelectedDoctorId(result.doctor.id);
      } else if (result.outcome === "not_found" || result.outcome === "unavailable") {
        setError(result.message);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function onCheckAvailability() {
    if (!selectedDoctorId) {
      setError("Select a doctor before checking availability.");
      return;
    }
    setBusy("availability");
    setError(null);
    setAvailability(null);
    setSelectedSlot(null);
    setBookResult(null);
    try {
      const resolved = await resolveDateTime({ phrase: phrase.trim() });
      setResolveResult(resolved);
      if (resolved.outcome !== "resolved" || !resolved.window) {
        setError(resolved.message);
        return;
      }
      const avail = await checkAvailability({
        doctorId: selectedDoctorId,
        window: resolved.window,
      });
      setAvailability(avail);
      if (avail.outcome !== "available" || avail.slots.length === 0) {
        setError(avail.message || "No open slots returned by the API for that window.");
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function onBook() {
    if (!patient || !selectedDoctor || !selectedSlot) {
      return;
    }
    if (!confirmed) {
      setError("Confirm the booking before submitting. The Book button stays disabled until then.");
      return;
    }
    setBusy("book");
    setError(null);
    setBookResult(null);
    try {
      const result = await bookAppointment({
        patientId: patient.id,
        doctorId: selectedDoctor.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
        confirmed: true,
      });
      setBookResult(result);
      if (!isBookedOutcome(result)) {
        setError(result.message || `Booking did not persist (outcome: ${result.outcome}).`);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="booking" data-testid="appointment-booking">
      <p className="placeholder">
        Slots and bookings come only from the backend. Nothing is invented in the UI.
      </p>

      {error ? (
        <p className="booking__error" data-testid="booking-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="booking__step" data-testid="booking-step-identify">
        <h3>1. Identify patient</h3>
        <div className="booking__row">
          <label className="booking__field">
            <span>Phone</span>
            <input
              data-testid="booking-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15550001001"
              autoComplete="tel"
            />
          </label>
          <label className="booking__field">
            <span>Name</span>
            <input
              data-testid="booking-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Patient name"
              autoComplete="name"
            />
          </label>
          <button
            type="button"
            className="button"
            data-testid="booking-identify"
            disabled={busy !== null}
            onClick={() => void onIdentify()}
          >
            {busy === "identify" ? "Identifying…" : "Identify"}
          </button>
        </div>
        {patient ? (
          <p className="booking__ok" data-testid="booking-patient">
            Patient: {patient.name} ({patient.id})
          </p>
        ) : null}
        {identifyNote ? <p className="placeholder">{identifyNote}</p> : null}
      </section>

      <section className="booking__step" data-testid="booking-step-doctor">
        <h3>2. Search doctor</h3>
        <div className="booking__row">
          <label className="booking__field">
            <span>Specialization</span>
            <input
              data-testid="booking-specialization"
              value={doctorQuery.specialization}
              onChange={(e) => setDoctorQuery((q) => ({ ...q, specialization: e.target.value }))}
            />
          </label>
          <label className="booking__field">
            <span>Doctor name (optional)</span>
            <input
              data-testid="booking-doctor-name"
              value={doctorQuery.name}
              onChange={(e) => setDoctorQuery((q) => ({ ...q, name: e.target.value }))}
            />
          </label>
          <button
            type="button"
            className="button"
            data-testid="booking-search-doctors"
            disabled={busy !== null}
            onClick={() => void onSearchDoctors()}
          >
            {busy === "search" ? "Searching…" : "Search"}
          </button>
        </div>
        {doctors.length > 0 ? (
          <ul className="booking__list" data-testid="booking-doctor-list">
            {doctors.map((doc) => (
              <li key={doc.id}>
                <label className="booking__choice">
                  <input
                    type="radio"
                    name="doctor"
                    value={doc.id}
                    checked={selectedDoctorId === doc.id}
                    onChange={() => {
                      setSelectedDoctorId(doc.id);
                      setAvailability(null);
                      setSelectedSlot(null);
                      setBookResult(null);
                    }}
                  />
                  <span>
                    {doc.name} — {doc.specialization} ({doc.availabilityStatus})
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
        {doctorNote ? <p className="placeholder">{doctorNote}</p> : null}
      </section>

      <section className="booking__step" data-testid="booking-step-availability">
        <h3>3. Check availability</h3>
        <div className="booking__row">
          <label className="booking__field booking__field--wide">
            <span>When (natural phrase)</span>
            <input
              data-testid="booking-phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="tomorrow morning"
            />
          </label>
          <button
            type="button"
            className="button"
            data-testid="booking-check-availability"
            disabled={busy !== null || !selectedDoctorId}
            onClick={() => void onCheckAvailability()}
          >
            {busy === "availability" ? "Checking…" : "Find slots"}
          </button>
        </div>
        {resolveResult?.outcome === "resolved" && resolveResult.window ? (
          <p className="placeholder" data-testid="booking-resolved-window">
            Window: {resolveResult.window.date} {resolveResult.window.timeStart}–
            {resolveResult.window.timeEnd} ({resolveResult.window.partOfDay})
          </p>
        ) : null}
        {slots.length > 0 ? (
          <ul className="booking__list" data-testid="booking-slot-list">
            {slots.map((slot) => {
              const key = `${slot.date}|${slot.time}`;
              const checked =
                selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
              return (
                <li key={key}>
                  <label className="booking__choice">
                    <input
                      type="radio"
                      name="slot"
                      value={key}
                      checked={checked}
                      onChange={() => {
                        setSelectedSlot(slot);
                        setBookResult(null);
                      }}
                    />
                    <span>
                      {slot.date} at {slot.time}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : availability ? (
          <p className="placeholder" data-testid="booking-slots-empty">
            {availability.message || "No slots from checkAvailability."}
          </p>
        ) : null}
      </section>

      <section className="booking__step" data-testid="booking-step-confirm">
        <h3>4. Confirm and book</h3>
        <label className="booking__confirm" data-testid="booking-confirm-label">
          <input
            type="checkbox"
            data-testid="booking-confirm"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span>
            I confirm booking
            {selectedDoctor && selectedSlot
              ? ` ${selectedDoctor.name} on ${selectedSlot.date} at ${selectedSlot.time}`
              : ""}
            .
          </span>
        </label>
        <button
          type="button"
          className="button"
          data-testid="booking-submit"
          disabled={!canBook}
          onClick={() => void onBook()}
        >
          {busy === "book" ? "Booking…" : "Book appointment"}
        </button>
        {!confirmed ? (
          <p className="placeholder" data-testid="booking-confirm-hint">
            Book stays disabled until you check the confirmation box.
          </p>
        ) : null}
      </section>

      {bookResult && isBookedOutcome(bookResult) ? (
        <section className="booking__success" data-testid="booking-success">
          <h3>Booked</h3>
          <dl className="settings-list">
            <div>
              <dt>Appointment ID</dt>
              <dd data-testid="booking-appointment-id">{bookResult.confirmation.appointmentId}</dd>
            </div>
            <div>
              <dt>Doctor</dt>
              <dd>
                {bookResult.confirmation.doctorName} ({bookResult.confirmation.doctorId})
              </dd>
            </div>
            <div>
              <dt>When</dt>
              <dd>
                {bookResult.confirmation.date} {bookResult.confirmation.time}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{bookResult.confirmation.status}</dd>
            </div>
          </dl>
          <p className="placeholder">{bookResult.message}</p>
        </section>
      ) : null}

      {bookResult && !isBookedOutcome(bookResult) ? (
        <p className="placeholder" data-testid="booking-not-booked">
          Outcome: {bookResult.outcome} — {bookResult.message}
        </p>
      ) : null}
    </div>
  );
}
