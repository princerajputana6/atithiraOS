import { CRM_PERMISSIONS, listDeals, createDeal } from "@atithira/module-crm";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("crm", CRM_PERMISSIONS.DEAL_READ, async () => {
    const deals = await listDeals();
    return { deals };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("crm", CRM_PERMISSIONS.DEAL_WRITE, async () => {
    if (!body.title) throw new Error("title is required");
    if (typeof body.amount !== "number") throw new Error("amount must be a number");
    const deal = await createDeal(body);
    return { deal };
  });
}
