import { HOTEL_PERMISSIONS, listBookings, createBooking } from "@atithira/module-hotel";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("hotel", HOTEL_PERMISSIONS.BOOKING_READ, async () => {
    const bookings = await listBookings();
    return { bookings };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("hotel", HOTEL_PERMISSIONS.BOOKING_WRITE, async () => {
    if (!body.guestName || !body.roomId || !body.checkIn || !body.checkOut) {
      throw new Error("guestName, roomId, checkIn, and checkOut are required");
    }
    const booking = await createBooking(body);
    return { booking };
  });
}
