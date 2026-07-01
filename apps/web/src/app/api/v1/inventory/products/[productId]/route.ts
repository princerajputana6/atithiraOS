import { INVENTORY_PERMISSIONS, adjustStock } from "@atithira/module-inventory";
import type { StockMovementType } from "@atithira/types";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    type?: StockMovementType;
    qty?: number;
    note?: string;
  };
  return tenantApiForModule("inventory", INVENTORY_PERMISSIONS.STOCK_WRITE, async () => {
    if (!body.type || typeof body.qty !== "number") {
      throw new Error("type and numeric qty are required");
    }
    const product = await adjustStock({
      productId,
      type: body.type,
      qty: body.qty,
      note: body.note,
    });
    return { product };
  });
}
