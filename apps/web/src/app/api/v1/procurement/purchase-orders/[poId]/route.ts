import { PROCUREMENT_PERMISSIONS, receivePurchaseOrder } from "@atithira/module-inventory";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ poId: string }> },
) {
  const { poId } = await params;
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  return tenantApiForModule("procurement", PROCUREMENT_PERMISSIONS.PO_RECEIVE, async () => {
    if (body.action !== "receive") throw new Error("action must be receive");
    const purchaseOrder = await receivePurchaseOrder(poId);
    return { purchaseOrder };
  });
}
