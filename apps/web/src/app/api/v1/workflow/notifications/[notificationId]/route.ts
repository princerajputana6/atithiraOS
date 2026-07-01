import {
  WORKFLOW_PERMISSIONS,
  markNotificationRead,
} from "@atithira/core-workflow";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  const { notificationId } = await params;
  return tenantApiForModule("automation", WORKFLOW_PERMISSIONS.NOTIFICATION_READ, async () => {
    await markNotificationRead(notificationId);
    return { ok: true };
  });
}
