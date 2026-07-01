import { MARKETPLACE_PERMISSIONS, uninstall } from "@atithira/core-marketplace";
import { tenantApi } from "@/lib/api";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ installationId: string }> },
) {
  const { installationId } = await params;
  return tenantApi(MARKETPLACE_PERMISSIONS.INSTALL, async () => {
    await uninstall(installationId);
    return { ok: true };
  });
}
