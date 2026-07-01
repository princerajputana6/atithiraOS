import {
  RESTAURANT_PERMISSIONS,
  listOrders,
  createOrder,
} from "@atithira/module-restaurant";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.ORDER_READ, async () => {
    const orders = await listOrders();
    return { orders };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.ORDER_WRITE, async () => {
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new Error("items[] is required");
    }
    const order = await createOrder({
      type: body.type === "takeaway" ? "takeaway" : "dine_in",
      tableId: body.tableId,
      items: body.items,
    });
    return { order };
  });
}
