import { OrdersClient } from "@/components/website/orders-client";
import { requireModule } from "@/lib/require-module";

export default async function WebsiteOrdersPage() {
  await requireModule("website");
  return <OrdersClient />;
}
