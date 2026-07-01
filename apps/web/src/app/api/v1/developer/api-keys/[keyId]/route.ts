import { DEVELOPER_PERMISSIONS, revokeApiKey } from "@atithira/core-developer";
import { tenantApi } from "@/lib/api";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ keyId: string }> },
) {
  const { keyId } = await params;
  return tenantApi(DEVELOPER_PERMISSIONS.APIKEY_MANAGE, async () => {
    await revokeApiKey(keyId);
    return { ok: true };
  });
}
