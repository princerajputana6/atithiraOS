import { WEBSITE_PERMISSIONS, listForms, createForm } from "@atithira/module-website";
import type { SiteFormField } from "@atithira/types";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.FORM_READ, async () => {
    const forms = await listForms();
    return { forms };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.FORM_WRITE, async () => {
    if (!body.name) throw new Error("name is required");
    if (!Array.isArray(body.fields) || body.fields.length === 0) {
      throw new Error("A form needs at least one field");
    }
    const fields = body.fields as SiteFormField[];
    const form = await createForm({
      name: body.name,
      fields,
      submitText: body.submitText,
      createsLead: body.createsLead,
    });
    return { form };
  });
}
