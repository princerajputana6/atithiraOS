import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import { ensureTextIndex, textSearch } from "@atithira/core-search";
import type { Project, Task, TaskStatus } from "@atithira/types";

export class ProjectRepository extends TenantScopedRepository<Project> {
  protected readonly targetType = "project";
  constructor(collection: Collection<Project>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
}

export class TaskRepository extends TenantScopedRepository<Task> {
  protected readonly targetType = "task";
  constructor(collection: Collection<Task>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  listForProject(projectId: string) {
    return this.find({ projectId } as Filter<Task>);
  }
  async ensureSearchIndex() {
    await ensureTextIndex(this.collection, { title: "text" });
  }
  search(query: string) {
    return textSearch(this.collection, this.requireTenantId(), query);
  }
  setStatus(id: string, status: TaskStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `task.${status}` },
    );
  }
}

export async function getProjectRepository() {
  const db = await getDb();
  return new ProjectRepository(db.collection<Project>("projects_projects"));
}
export async function getTaskRepository() {
  const db = await getDb();
  return new TaskRepository(db.collection<Task>("projects_tasks"));
}
