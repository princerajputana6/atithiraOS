import { OrdersClient } from "@/components/restaurant/orders-client";
import { requireModule } from "@/lib/require-module";

export default async function OrdersPage() {
  await requireModule("restaurant");
  return <OrdersClient />;
}
