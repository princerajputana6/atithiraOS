import {
  MARKETPLACE_PERMISSIONS,
  listMyListings,
} from "@atithira/core-marketplace";
import { tenantApi } from "@/lib/api";

export async function GET() {
  return tenantApi(MARKETPLACE_PERMISSIONS.PUBLISH, async () => {
    const listings = await listMyListings();
    return { listings };
  });
}
