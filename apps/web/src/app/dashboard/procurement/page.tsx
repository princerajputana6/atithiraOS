import { ProcurementClient } from "@/components/procurement/procurement-client";
import { requireModule } from "@/lib/require-module";

export default async function ProcurementPage() {
  await requireModule("procurement");
  return <ProcurementClient />;
}
