import { TablesClient } from "@/components/restaurant/tables-client";
import { requireModule } from "@/lib/require-module";

export default async function TablesPage() {
  await requireModule("restaurant");
  return <TablesClient />;
}
