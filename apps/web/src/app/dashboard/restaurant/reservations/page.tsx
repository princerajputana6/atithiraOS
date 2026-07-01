import { ReservationsClient } from "@/components/restaurant/reservations-client";
import { requireModule } from "@/lib/require-module";

export default async function ReservationsPage() {
  await requireModule("restaurant");
  return <ReservationsClient />;
}
