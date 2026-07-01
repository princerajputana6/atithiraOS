import {
  PROJECTS_PERMISSIONS,
  listProjects,
  createProject,
} from "@atithira/module-projects";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("projects", PROJECTS_PERMISSIONS.PROJECT_READ, async () => {
    const projects = await listProjects();
    return { projects };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("projects", PROJECTS_PERMISSIONS.PROJECT_WRITE, async () => {
    if (!body.name) throw new Error("name is required");
    const project = await createProject(body);
    return { project };
  });
}
