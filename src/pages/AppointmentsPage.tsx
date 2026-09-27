import { AppointmentBookingPanel } from "@/components/AppointmentBookingPanel";
import { Panel } from "@/components/Panel";

export function AppointmentsPage() {
  return (
    <div className="page" data-testid="appointments-page">
      <div className="page__intro">
        <h2>Appointments</h2>
        <p>
          Book a clinic visit using live backend availability. Confirm explicitly before the write —
          the UI never invents slots or claims success without API confirmation.
        </p>
      </div>
      <Panel title="Book appointment" chip="KAN-109">
        <AppointmentBookingPanel />
      </Panel>
    </div>
  );
}
