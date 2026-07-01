import { PatientsClient } from "@/components/clinic/patients-client";
import { requireModule } from "@/lib/require-module";

export default async function PatientsPage() {
  await requireModule("clinic");
  return <PatientsClient />;
}
