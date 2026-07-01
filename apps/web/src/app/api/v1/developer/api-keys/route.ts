import {
  DEVELOPER_PERMISSIONS,
  listApiKeys,
  createApiKey,
} from "@atithira/core-developer";
import { tenantApi } from "@/lib/api";

export async function GET() {
  return tenantApi(DEVELOPER_PERMISSIONS.APIKEY_MANAGE, async () => {
    const keys = await listApiKeys();
    return {
      keys: keys.map((k) => ({
        _id: k._id,
        name: k.name,
        prefix: k.prefix,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
      })),
    };
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  return tenantApi(DEVELOPER_PERMISSIONS.APIKEY_MANAGE, async () => {
    if (!body.name) throw new Error("name is required");
    const created = await createApiKey(body.name);
    // plaintextKey is returned exactly once — the client must save it now.
    return { id: created.record._id, key: created.plaintextKey };
  });
}
