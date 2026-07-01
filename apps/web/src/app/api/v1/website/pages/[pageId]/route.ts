import {
  WEBSITE_PERMISSIONS,
  getPage,
  updatePage,
  setPageStatus,
  deletePage,
} from "@atithira/module-website";
import { tenantApiForModule } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.PAGE_READ, async () => {
    const page = await getPage(pageId);
    if (!page) throw new Error("Page not found");
    return { page };
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.PAGE_WRITE, async () => {
    if (body.status === "published" || body.status === "draft") {
      await setPageStatus(pageId, body.status);
    } else {
      await updatePage(pageId, {
        title: body.title,
        slug: body.slug,
        blocks: body.blocks,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        isHome: body.isHome,
      });
    }
    return { ok: true };
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.PAGE_WRITE, async () => {
    await deletePage(pageId);
    return { ok: true };
  });
}
