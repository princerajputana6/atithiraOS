import {
  WORKFLOW_PERMISSIONS,
  listNotifications,
} from "@atithira/core-workflow";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("automation", WORKFLOW_PERMISSIONS.NOTIFICATION_READ, async () => {
    const notifications = await listNotifications();
    return { notifications };
  });
}
