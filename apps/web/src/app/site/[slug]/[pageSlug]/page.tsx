import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPublishedSite } from "@/lib/public-site";
import { SiteRenderer } from "@/components/website/site-renderer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  const site = await loadPublishedSite(slug, pageSlug);
  if (!site) return { title: "Page not found" };
  return {
    title: site.page.metaTitle ?? `${site.page.title} · ${site.orgName}`,
    description: site.page.metaDescription,
  };
}

export default async function PublicSubPage({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}) {
  const { slug, pageSlug } = await params;
  const site = await loadPublishedSite(slug, pageSlug);
  if (!site) notFound();

  return (
    <main className="min-h-screen bg-white">
      <SiteRenderer blocks={site.page.blocks} forms={site.forms} slug={slug} businessName={site.orgName} />
      <footer className="border-t border-slate-100 px-6 py-8 text-center text-xs text-slate-400">
        {site.orgName} · powered by Atithira
      </footer>
    </main>
  );
}
