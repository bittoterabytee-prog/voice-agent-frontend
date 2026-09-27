import { AppointmentBookingPanel } from "@/components/AppointmentBookingPanel";
import { AppointmentManagePanel } from "@/components/AppointmentManagePanel";
import { Panel } from "@/components/Panel";

export function AppointmentsPage() {
  return (
    <div className="page" data-testid="appointments-page">
      <div className="page__intro">
        <h2>Appointments</h2>
        <p>
          Book or manage clinic visits using live backend availability. Confirm explicitly before
          any write — the UI never invents slots or claims success without API confirmation.
        </p>
      </div>
      <Panel title="Book appointment" chip="KAN-109">
        <AppointmentBookingPanel />
      </Panel>
      <Panel title="Manage appointment" chip="KAN-110">
        <AppointmentManagePanel />
      </Panel>
    </div>
  );
}
