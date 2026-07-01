import {
  RESTAURANT_PERMISSIONS,
  updateOrderStatus,
} from "@atithira/module-restaurant";
import { ORDER_STATUSES, type OrderStatus } from "@atithira/types";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: OrderStatus };
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.ORDER_WRITE, async () => {
    if (!body.status || !ORDER_STATUSES.includes(body.status)) {
      throw new Error(`status must be one of: ${ORDER_STATUSES.join(", ")}`);
    }
    await updateOrderStatus(orderId, body.status);
    return { ok: true };
  });
}
