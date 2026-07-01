import { PosClient } from "@/components/retail/pos-client";
import { requireModule } from "@/lib/require-module";

export default async function RetailPage() {
  await requireModule("retail");
  return <PosClient />;
}
