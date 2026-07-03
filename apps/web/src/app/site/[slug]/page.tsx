import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPublishedSite } from "@/lib/public-site";
import { BrandLogoBadge } from "@/components/brand-logo";
import { SiteRenderer } from "@/components/website/site-renderer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadPublishedSite(slug);
  if (!site) return { title: "Site not found" };
  return {
    title: site.page.metaTitle ?? `${site.page.title} · ${site.orgName}`,
    description: site.page.metaDescription,
  };
}

export default async function PublicHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await loadPublishedSite(slug);
  if (!site) notFound();

  return (
    <main className="min-h-screen bg-white">
      <SiteRenderer blocks={site.page.blocks} forms={site.forms} slug={slug} businessName={site.orgName} />
      <footer className="flex items-center justify-center gap-2 border-t border-slate-100 px-6 py-8 text-center text-xs text-slate-400">
        <span>{site.orgName} · powered by</span>
        <BrandLogoBadge
          className="inline-flex items-center rounded-lg bg-brand-700 px-2.5 py-1.5 shadow-sm"
          logoClassName="h-5 w-auto max-w-[6rem] object-contain"
        />
      </footer>
    </main>
  );
}
