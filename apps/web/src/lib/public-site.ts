import { getOrganizationRepository } from "@atithira/core-tenancy";
import { getPublishedPage, listForms } from "@atithira/module-website";
import { runWithTenantContext } from "@atithira/db";
import type { SitePage, SiteForm } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";

export interface PublicSiteData {
  orgName: string;
  slug: string;
  page: SitePage;
  forms: SiteForm[];
}

/**
 * Loads a tenant's published page for the public site by org slug. Returns
 * null when the tenant, or a published page at that slug, doesn't exist —
 * callers render notFound(). Runs in the resolved tenant's context so every
 * read stays tenant-scoped even though the visitor is unauthenticated.
 */
export async function loadPublishedSite(
  slug: string,
  pageSlug?: string,
): Promise<PublicSiteData | null> {
  await ensureBootstrapped();
  const orgRepo = await getOrganizationRepository();
  const org = await orgRepo.findBySlug(slug);
  if (!org) return null;

  return runWithTenantContext({ tenantId: org._id, userId: null }, async () => {
    const page = await getPublishedPage(pageSlug);
    if (!page) return null;
    const forms = await listForms();
    return { orgName: org.name, slug, page, forms };
  });
}
