import { BookingsClient } from "@/components/hotel/bookings-client";
import { requireModule } from "@/lib/require-module";

export default async function BookingsPage() {
  await requireModule("hotel");
  return <BookingsClient />;
}
