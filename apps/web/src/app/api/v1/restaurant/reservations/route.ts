import {
  RESTAURANT_PERMISSIONS,
  listReservations,
  createReservation,
} from "@atithira/module-restaurant";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.RESERVATION_MANAGE, async () => {
    const reservations = await listReservations();
    return { reservations };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.RESERVATION_MANAGE, async () => {
    if (!body.guestName || !body.date || !body.time) {
      throw new Error("guestName, date, and time are required");
    }
    const reservation = await createReservation({
      guestName: body.guestName,
      phone: body.phone,
      partySize: Number(body.partySize) || 2,
      date: body.date,
      time: body.time,
      tableId: body.tableId,
      notes: body.notes,
    });
    return { reservation };
  });
}
