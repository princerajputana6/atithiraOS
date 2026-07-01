import { HOTEL_PERMISSIONS, listRooms, createRoom } from "@atithira/module-hotel";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("hotel", HOTEL_PERMISSIONS.ROOM_MANAGE, async () => {
    const rooms = await listRooms();
    return { rooms };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("hotel", HOTEL_PERMISSIONS.ROOM_MANAGE, async () => {
    if (!body.number) throw new Error("number is required");
    if (typeof body.ratePerNight !== "number") throw new Error("ratePerNight must be a number");
    const room = await createRoom({ number: body.number, type: body.type ?? "standard", ratePerNight: body.ratePerNight });
    return { room };
  });
}
