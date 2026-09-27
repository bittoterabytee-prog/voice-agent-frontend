import { useState } from "react";
import { ApiError } from "@/services/apiClient";
import {
  cancelAppointment,
  checkAvailability,
  lookupAppointment,
  rescheduleAppointment,
  resolveDateTime,
} from "@/services/appointmentService";
import type {
  Appointment,
  AvailabilitySlot,
  CancelAppointmentResult,
  CheckAvailabilityResult,
  GetAppointmentResult,
  RescheduleAppointmentResult,
} from "@/types/appointments";
import { isCancelledOutcome, isRescheduledOutcome } from "@/types/appointments";

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  return "Request failed. Check that the backend is running.";
}

function formatAppointment(appt: Appointment): string {
  return `${appt.id} — ${appt.appointmentDate} ${appt.appointmentTime} (${appt.status})`;
}

export function AppointmentManagePanel() {
  const [appointmentId, setAppointmentId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [lookupResult, setLookupResult] = useState<GetAppointmentResult | null>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [cancelResult, setCancelResult] = useState<CancelAppointmentResult | null>(null);

  const [phrase, setPhrase] = useState("tomorrow afternoon");
  const [availability, setAvailability] = useState<CheckAvailabilityResult | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [rescheduleConfirmed, setRescheduleConfirmed] = useState(false);
  const [rescheduleResult, setRescheduleResult] = useState<RescheduleAppointmentResult | null>(
    null,
  );

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onLookup() {
    setBusy("lookup");
    setError(null);
    setLookupResult(null);
    setSelected(null);
    setCancelResult(null);
    setRescheduleResult(null);
    setAvailability(null);
    setSelectedSlot(null);
    try {
      const result = await lookupAppointment({
        appointmentId: appointmentId.trim() || undefined,
        patientId: patientId.trim() || undefined,
      });
      setLookupResult(result);
      if (result.outcome === "found" && result.appointment) {
        setSelected(result.appointment);
        setPatientId(result.appointment.patientId);
      } else if (result.outcome === "not_found") {
        setError(result.message || "No appointments match.");
      } else if (result.outcome === "multiple_matches") {
        setError(result.message || "Multiple appointments matched; pick one.");
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function onCancel() {
    if (!selected) return;
    if (!cancelConfirmed) {
      setError("Confirm cancel before submitting. Cancel stays disabled until then.");
      return;
    }
    setBusy("cancel");
    setError(null);
    setCancelResult(null);
    try {
      const result = await cancelAppointment({
        appointmentId: selected.id,
        patientId: selected.patientId,
        confirmed: true,
      });
      setCancelResult(result);
      if (isCancelledOutcome(result)) {
        setSelected(result.appointment);
        setLookupResult({
          outcome: "found",
          appointment: result.appointment,
          appointments: [result.appointment],
          isActive: false,
          message: result.message,
        });
      } else {
        setError(result.message || `Cancel did not persist (outcome: ${result.outcome}).`);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function onFindRescheduleSlots() {
    if (!selected) {
      setError("Lookup and select an appointment first.");
      return;
    }
    setBusy("slots");
    setError(null);
    setAvailability(null);
    setSelectedSlot(null);
    setRescheduleResult(null);
    try {
      const resolved = await resolveDateTime({ phrase: phrase.trim() });
      if (resolved.outcome !== "resolved" || !resolved.window) {
        setError(resolved.message);
        return;
      }
      const avail = await checkAvailability({
        doctorId: selected.doctorId,
        window: resolved.window,
        excludeAppointmentId: selected.id,
      });
      setAvailability(avail);
      if (avail.outcome !== "available" || avail.slots.length === 0) {
        setError(avail.message || "No open slots from checkAvailability.");
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function onReschedule() {
    if (!selected || !selectedSlot) return;
    if (!rescheduleConfirmed) {
      setError("Confirm reschedule before submitting.");
      return;
    }
    setBusy("reschedule");
    setError(null);
    setRescheduleResult(null);
    try {
      const result = await rescheduleAppointment({
        appointmentId: selected.id,
        patientId: selected.patientId,
        date: selectedSlot.date,
        time: selectedSlot.time,
        confirmed: true,
      });
      setRescheduleResult(result);
      if (isRescheduledOutcome(result)) {
        setSelected(result.appointment);
        setLookupResult({
          outcome: "found",
          appointment: result.appointment,
          appointments: [result.appointment],
          isActive: result.appointment.status === "SCHEDULED",
          message: result.message,
        });
      } else {
        setError(result.message || `Reschedule did not persist (outcome: ${result.outcome}).`);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const slots = availability?.slots ?? [];
  const canCancel = Boolean(selected && cancelConfirmed && !busy && selected.status === "SCHEDULED");
  const canReschedule = Boolean(
    selected && selectedSlot && rescheduleConfirmed && !busy && selected.status === "SCHEDULED",
  );

  return (
    <div className="booking" data-testid="appointment-manage">
      <p className="placeholder">
        Lookup, cancel, and reschedule use live backend data only. Confirmation is required before
        any write.
      </p>

      {error ? (
        <p className="booking__error" data-testid="manage-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="booking__step" data-testid="manage-step-lookup">
        <h3>1. Lookup appointment</h3>
        <div className="booking__row">
          <label className="booking__field">
            <span>Appointment ID</span>
            <input
              data-testid="manage-appointment-id"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              placeholder="uuid"
            />
          </label>
          <label className="booking__field">
            <span>Patient ID</span>
            <input
              data-testid="manage-patient-id"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="uuid"
            />
          </label>
          <button
            type="button"
            className="button"
            data-testid="manage-lookup"
            disabled={busy !== null}
            onClick={() => void onLookup()}
          >
            {busy === "lookup" ? "Looking up…" : "Lookup"}
          </button>
        </div>

        {lookupResult?.outcome === "not_found" ? (
          <p className="placeholder" data-testid="manage-not-found">
            {lookupResult.message}
          </p>
        ) : null}

        {lookupResult?.outcome === "multiple_matches" ? (
          <ul className="booking__list" data-testid="manage-multiple-list">
            {lookupResult.appointments.map((appt) => (
              <li key={appt.id}>
                <label className="booking__choice">
                  <input
                    type="radio"
                    name="manage-appt"
                    checked={selected?.id === appt.id}
                    onChange={() => {
                      setSelected(appt);
                      setPatientId(appt.patientId);
                      setCancelResult(null);
                      setRescheduleResult(null);
                    }}
                  />
                  <span>{formatAppointment(appt)}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}

        {selected ? (
          <dl className="settings-list" data-testid="manage-selected">
            <div>
              <dt>Appointment</dt>
              <dd data-testid="manage-selected-id">{selected.id}</dd>
            </div>
            <div>
              <dt>When</dt>
              <dd>
                {selected.appointmentDate} {selected.appointmentTime}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd data-testid="manage-selected-status">{selected.status}</dd>
            </div>
            <div>
              <dt>Patient / Doctor</dt>
              <dd>
                {selected.patientId} / {selected.doctorId}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="booking__step" data-testid="manage-step-cancel">
        <h3>2. Cancel</h3>
        <label className="booking__confirm">
          <input
            type="checkbox"
            data-testid="manage-cancel-confirm"
            checked={cancelConfirmed}
            onChange={(e) => setCancelConfirmed(e.target.checked)}
          />
          <span>I confirm cancelling this appointment.</span>
        </label>
        <button
          type="button"
          className="button"
          data-testid="manage-cancel"
          disabled={!canCancel}
          onClick={() => void onCancel()}
        >
          {busy === "cancel" ? "Cancelling…" : "Cancel appointment"}
        </button>
        {!cancelConfirmed ? (
          <p className="placeholder" data-testid="manage-cancel-hint">
            Cancel stays disabled until you check the confirmation box.
          </p>
        ) : null}
        {cancelResult && isCancelledOutcome(cancelResult) ? (
          <p className="booking__ok" data-testid="manage-cancel-success">
            Cancelled — status {cancelResult.appointment.status}
          </p>
        ) : null}
        {cancelResult && !isCancelledOutcome(cancelResult) ? (
          <p className="placeholder" data-testid="manage-cancel-outcome">
            Outcome: {cancelResult.outcome} — {cancelResult.message}
          </p>
        ) : null}
      </section>

      <section className="booking__step" data-testid="manage-step-reschedule">
        <h3>3. Reschedule</h3>
        <div className="booking__row">
          <label className="booking__field booking__field--wide">
            <span>New when (phrase)</span>
            <input
              data-testid="manage-reschedule-phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="button"
            data-testid="manage-find-slots"
            disabled={busy !== null || !selected}
            onClick={() => void onFindRescheduleSlots()}
          >
            {busy === "slots" ? "Checking…" : "Find slots"}
          </button>
        </div>
        {slots.length > 0 ? (
          <ul className="booking__list" data-testid="manage-slot-list">
            {slots.map((slot) => {
              const key = `${slot.date}|${slot.time}`;
              const checked =
                selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
              return (
                <li key={key}>
                  <label className="booking__choice">
                    <input
                      type="radio"
                      name="manage-slot"
                      checked={checked}
                      onChange={() => setSelectedSlot(slot)}
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
          <p className="placeholder" data-testid="manage-slots-empty">
            {availability.message || "No slots from checkAvailability."}
          </p>
        ) : null}
        <label className="booking__confirm">
          <input
            type="checkbox"
            data-testid="manage-reschedule-confirm"
            checked={rescheduleConfirmed}
            onChange={(e) => setRescheduleConfirmed(e.target.checked)}
          />
          <span>I confirm rescheduling to the selected slot.</span>
        </label>
        <button
          type="button"
          className="button"
          data-testid="manage-reschedule"
          disabled={!canReschedule}
          onClick={() => void onReschedule()}
        >
          {busy === "reschedule" ? "Rescheduling…" : "Reschedule appointment"}
        </button>
        {rescheduleResult && isRescheduledOutcome(rescheduleResult) ? (
          <p className="booking__ok" data-testid="manage-reschedule-success">
            Rescheduled to {rescheduleResult.appointment.appointmentDate}{" "}
            {rescheduleResult.appointment.appointmentTime} (was {rescheduleResult.previous.date}{" "}
            {rescheduleResult.previous.time})
          </p>
        ) : null}
        {rescheduleResult && !isRescheduledOutcome(rescheduleResult) ? (
          <p className="placeholder" data-testid="manage-reschedule-outcome">
            Outcome: {rescheduleResult.outcome} — {rescheduleResult.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}
