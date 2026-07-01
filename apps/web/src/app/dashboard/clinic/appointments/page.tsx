import { AppointmentsClient } from "@/components/clinic/appointments-client";
import { requireModule } from "@/lib/require-module";

export default async function AppointmentsPage() {
  await requireModule("clinic");
  return <AppointmentsClient />;
}
