import {
  MARKETPLACE_PERMISSIONS,
  listPublishedListings,
  publishListing,
} from "@atithira/core-marketplace";
import { tenantApi, tenantApiOrApiKey } from "@/lib/api";

export async function GET() {
  return tenantApi(MARKETPLACE_PERMISSIONS.BROWSE, async () => {
    const listings = await listPublishedListings();
    return { listings };
  });
}

// Accepts an API-key bearer token (the SDK's publishModule path) OR a session.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiOrApiKey(req, MARKETPLACE_PERMISSIONS.PUBLISH, async () => {
    if (!body.type || !body.slug || !body.name || !body.description) {
      throw new Error("type, slug, name, and description are required");
    }
    const listing = await publishListing(body);
    return { listing };
  });
}
