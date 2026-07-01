import { NextResponse } from "next/server";
import { getOrganizationRepository } from "@atithira/core-tenancy";
import { getForm, recordSubmission } from "@atithira/module-website";
import { createLead } from "@atithira/module-crm";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";

/**
 * Public, unauthenticated form endpoint for a tenant's hosted site. Resolves
 * the tenant by org slug, records the submission, and — when the form is
 * marked createsLead — creates a CRM lead in the same tenant context. This is
 * the unified-data-model loop: a website visitor becomes a CRM lead with no
 * integration glue. Composed at the app layer so module-website never depends
 * on module-crm directly.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; formId: string }> },
) {
  await ensureBootstrapped();
  const { slug, formId } = await params;

  const orgRepo = await getOrganizationRepository();
  const org = await orgRepo.findBySlug(slug);
  if (!org) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    data?: Record<string, string>;
  };
  const data = body.data ?? {};

  try {
    await runWithTenantContext({ tenantId: org._id, userId: null }, async () => {
      const form = await getForm(formId);
      if (!form) throw new Error("Form not found");

      for (const field of form.fields) {
        if (field.required && !String(data[field.key] ?? "").trim()) {
          throw new Error(`${field.label} is required`);
        }
      }

      let leadId: string | null = null;
      if (form.createsLead) {
        const name =
          data.name ??
          data.fullName ??
          Object.values(data).find((v) => v?.trim()) ??
          "Website lead";
        const lead = await createLead({
          name,
          email: data.email,
          company: data.company,
          source: `website:${form.name}`,
        });
        leadId = String(lead._id);
      }

      await recordSubmission(formId, data, leadId);
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
