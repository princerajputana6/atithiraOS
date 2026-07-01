import {
  PROCUREMENT_PERMISSIONS,
  listPurchaseOrders,
  createPurchaseOrder,
} from "@atithira/module-inventory";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("procurement", PROCUREMENT_PERMISSIONS.PO_READ, async () => {
    const purchaseOrders = await listPurchaseOrders();
    return { purchaseOrders };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("procurement", PROCUREMENT_PERMISSIONS.PO_WRITE, async () => {
    if (!body.vendorId) throw new Error("vendorId is required");
    if (!Array.isArray(body.lines) || body.lines.length === 0) {
      throw new Error("At least one line item is required");
    }
    const purchaseOrder = await createPurchaseOrder({
      vendorId: body.vendorId,
      lines: body.lines.map((l: { productId: string; qty: number; unitPrice: number }) => ({
        productId: l.productId,
        qty: Number(l.qty),
        unitPrice: Number(l.unitPrice),
      })),
    });
    return { purchaseOrder };
  });
}
