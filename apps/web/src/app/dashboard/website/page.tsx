import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import {
  getActiveTenantIdForUser,
  getOrganizationRepository,
} from "@atithira/core-tenancy";
import { listPages, listForms } from "@atithira/module-website";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { requireModule } from "@/lib/require-module";
import { PageHeader, Card, CardBody, Badge } from "@/components/ui";

export default async function WebsitePage() {
  await requireModule("website");
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  const { slug, pageCount, publishedCount, formCount, hasHome } =
    await runWithTenantContext({ tenantId, userId: session.user.id }, async () => {
      const orgRepo = await getOrganizationRepository();
      const org = await orgRepo.findById(tenantId);
      const pages = await listPages();
      const forms = await listForms();
      return {
        slug: org?.slug ?? "",
        pageCount: pages.length,
        publishedCount: pages.filter((p) => p.status === "published").length,
        formCount: forms.length,
        hasHome: pages.some((p) => p.isHome && p.status === "published"),
      };
    });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const liveUrl = rootDomain ? `https://${slug}.${rootDomain}` : `/site/${slug}`;

  return (
    <div>
      <PageHeader
        title="Website"
        description="Your tenant-hosted site — build pages, capture leads with forms, and publish."
      />

      <Card className="mb-4">
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Public site</p>
            <p className="mt-1 font-mono text-sm text-slate-800">{liveUrl}</p>
            {!rootDomain && (
              <p className="mt-1 text-xs text-slate-400">
                A custom subdomain isn&apos;t configured yet — reachable at this in-app path for now.
              </p>
            )}
          </div>
          {hasHome ? (
            <Link
              href={liveUrl}
              target="_blank"
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              View live site ↗
            </Link>
          ) : (
            <Badge tone="amber">Publish a home page to go live</Badge>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Pages" value={pageCount} sub={`${publishedCount} published`} href="/dashboard/website/pages" />
        <Stat label="Forms" value={formCount} sub="lead capture" href="/dashboard/website/forms" />
        <Stat label="Live" value={publishedCount} sub="published pages" href="/dashboard/website/pages" />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, href }: { label: string; value: number; sub: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition hover:shadow-card-hover">
        <CardBody>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="text-xs text-slate-400">{sub}</p>
        </CardBody>
      </Card>
    </Link>
  );
}
