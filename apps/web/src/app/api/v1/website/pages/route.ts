import { WEBSITE_PERMISSIONS, listPages, createPage } from "@atithira/module-website";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.PAGE_READ, async () => {
    const pages = await listPages();
    return { pages };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.PAGE_WRITE, async () => {
    if (!body.title) throw new Error("title is required");
    const page = await createPage({
      title: body.title,
      slug: body.slug ?? body.title,
      isHome: !!body.isHome,
    });
    return { page };
  });
}
