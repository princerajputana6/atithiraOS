import {
  PROJECTS_PERMISSIONS,
  listTasks,
  createTask,
} from "@atithira/module-projects";
import { tenantApiForModule } from "@/lib/api";

export async function GET(req: Request) {
  const projectId = new URL(req.url).searchParams.get("projectId") ?? undefined;
  return tenantApiForModule("projects", PROJECTS_PERMISSIONS.TASK_READ, async () => {
    const tasks = await listTasks(projectId);
    return { tasks };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("projects", PROJECTS_PERMISSIONS.TASK_WRITE, async () => {
    if (!body.projectId || !body.title) {
      throw new Error("projectId and title are required");
    }
    const task = await createTask(body);
    return { task };
  });
}
