import { BookingsClient } from "@/components/website/bookings-client";
import { requireModule } from "@/lib/require-module";

export default async function WebsiteBookingsPage() {
  await requireModule("website");
  return <BookingsClient />;
}
