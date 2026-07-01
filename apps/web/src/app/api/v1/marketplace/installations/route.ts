import {
  MARKETPLACE_PERMISSIONS,
  listInstallations,
  installListing,
} from "@atithira/core-marketplace";
import { tenantApi } from "@/lib/api";

export async function GET() {
  return tenantApi(MARKETPLACE_PERMISSIONS.BROWSE, async () => {
    const installations = await listInstallations();
    return { installations };
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { listingId?: string };
  return tenantApi(MARKETPLACE_PERMISSIONS.INSTALL, async () => {
    if (!body.listingId) throw new Error("listingId is required");
    const result = await installListing(body.listingId);
    return result;
  });
}
