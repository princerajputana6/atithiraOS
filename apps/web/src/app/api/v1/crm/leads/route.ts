import { CRM_PERMISSIONS, listLeads, createLead } from "@atithira/module-crm";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("crm", CRM_PERMISSIONS.LEAD_READ, async () => {
    const leads = await listLeads();
    return { leads };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("crm", CRM_PERMISSIONS.LEAD_WRITE, async () => {
    if (!body.name) throw new Error("name is required");
    const lead = await createLead(body);
    return { lead };
  });
}
