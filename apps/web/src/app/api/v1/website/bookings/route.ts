import { WEBSITE_PERMISSIONS, listBookings, setBookingStatus } from "@atithira/module-website";
import type { FulfilmentStatus } from "@atithira/types";
import { tenantApiForModule } from "@/lib/api";

const STATUSES = new Set<FulfilmentStatus>(["pending", "confirmed", "completed", "cancelled"]);

/** Bookings placed from the tenant's website (newest first). */
export async function GET() {
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.SUBMISSION_READ, async () => {
    const bookings = await listBookings();
    bookings.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return { bookings };
  });
}

/** Update a booking's fulfilment status (confirm / complete / cancel). */
export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.PAGE_WRITE, async () => {
    if (!body.id || !STATUSES.has(body.status as FulfilmentStatus)) {
      throw new Error("id and a valid status are required");
    }
    await setBookingStatus(body.id, body.status as FulfilmentStatus);
    return { ok: true };
  });
}
