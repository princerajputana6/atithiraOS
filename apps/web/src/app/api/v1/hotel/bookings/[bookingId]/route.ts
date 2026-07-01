import { HOTEL_PERMISSIONS, updateBookingStatus } from "@atithira/module-hotel";
import { BOOKING_STATUSES, type BookingStatus } from "@atithira/types";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: BookingStatus };
  return tenantApiForModule("hotel", HOTEL_PERMISSIONS.BOOKING_WRITE, async () => {
    if (!body.status || !BOOKING_STATUSES.includes(body.status)) {
      throw new Error(`status must be one of: ${BOOKING_STATUSES.join(", ")}`);
    }
    await updateBookingStatus(bookingId, body.status);
    return { ok: true };
  });
}
