import {
  FINANCE_PERMISSIONS,
  listInvoices,
  createInvoice,
} from "@atithira/module-finance";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("finance", FINANCE_PERMISSIONS.INVOICE_READ, async () => {
    const invoices = await listInvoices();
    return { invoices };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("finance", FINANCE_PERMISSIONS.INVOICE_WRITE, async () => {
    if (!body.customerName) throw new Error("customerName is required");
    if (typeof body.amount !== "number") throw new Error("amount must be a number");
    const invoice = await createInvoice(body);
    return { invoice };
  });
}
