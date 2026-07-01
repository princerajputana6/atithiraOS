import { FINANCE_PERMISSIONS, payInvoice } from "@atithira/module-finance";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const { invoiceId } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    method?: string;
  };
  return tenantApiForModule("finance", FINANCE_PERMISSIONS.INVOICE_WRITE, async () => {
    if (body.action !== "pay") throw new Error("Unsupported action");
    await payInvoice(invoiceId, body.method);
    return { ok: true };
  });
}
