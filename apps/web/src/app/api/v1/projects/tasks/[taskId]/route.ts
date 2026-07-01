import { PROJECTS_PERMISSIONS, moveTask } from "@atithira/module-projects";
import { TASK_STATUSES, type TaskStatus } from "@atithira/types";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: TaskStatus };
  return tenantApiForModule("projects", PROJECTS_PERMISSIONS.TASK_WRITE, async () => {
    if (!body.status || !TASK_STATUSES.includes(body.status)) {
      throw new Error(`status must be one of: ${TASK_STATUSES.join(", ")}`);
    }
    await moveTask(taskId, body.status);
    return { ok: true };
  });
}
