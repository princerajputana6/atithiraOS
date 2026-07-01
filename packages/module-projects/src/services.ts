import { getTenantContext } from "@atithira/db";
import { publishEvent } from "@atithira/core-events";
import type { Project, Task, TaskStatus, TaskPriority } from "@atithira/types";
import { getProjectRepository, getTaskRepository } from "./repositories";

function requireCtx() {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");
  return ctx;
}

/* ------------------------------ Projects ----------------------------- */

export interface CreateProjectInput {
  name: string;
  description?: string;
  dueDate?: string;
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const ctx = requireCtx();
  const repo = await getProjectRepository();
  return repo.insertOne({
    name: input.name,
    description: input.description,
    status: "active",
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    ownerUserId: ctx.userId ?? "",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Project, "_id" | "tenantId">);
}

export async function listProjects(): Promise<Project[]> {
  return (await getProjectRepository()).list();
}

/* -------------------------------- Tasks ------------------------------ */

export interface CreateTaskInput {
  projectId: string;
  title: string;
  priority?: TaskPriority;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const repo = await getTaskRepository();
  return repo.insertOne({
    projectId: input.projectId,
    title: input.title,
    status: "todo",
    priority: input.priority ?? "medium",
    assigneeUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Task, "_id" | "tenantId">);
}

export async function listTasks(projectId?: string): Promise<Task[]> {
  const repo = await getTaskRepository();
  return projectId ? repo.listForProject(projectId) : repo.list();
}

export async function moveTask(
  taskId: string,
  status: TaskStatus,
): Promise<void> {
  const ctx = requireCtx();
  const repo = await getTaskRepository();
  await repo.setStatus(taskId, status);
  if (status === "done") {
    const all = await repo.list();
    const task = all.find((t) => String(t._id) === taskId);
    if (task) {
      await publishEvent("projects/task.completed", {
        tenantId: ctx.tenantId,
        taskId,
        projectId: task.projectId,
      });
    }
  }
}
