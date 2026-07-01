import {
  RESTAURANT_PERMISSIONS,
  setReservationStatus,
} from "@atithira/module-restaurant";
import { RESERVATION_STATUSES, type ReservationStatus } from "@atithira/types";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  const { reservationId } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: ReservationStatus };
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.RESERVATION_MANAGE, async () => {
    if (!body.status || !RESERVATION_STATUSES.includes(body.status)) {
      throw new Error(`status must be one of: ${RESERVATION_STATUSES.join(", ")}`);
    }
    await setReservationStatus(reservationId, body.status);
    return { ok: true };
  });
}
