import {
  CRM_PERMISSIONS,
  listContacts,
  createContact,
} from "@atithira/module-crm";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("crm", CRM_PERMISSIONS.CONTACT_READ, async () => {
    const contacts = await listContacts();
    return { contacts };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("crm", CRM_PERMISSIONS.CONTACT_WRITE, async () => {
    if (!body.name) throw new Error("name is required");
    const contact = await createContact(body);
    return { contact };
  });
}
