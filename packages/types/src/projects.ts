export type ProjectStatus = "active" | "on_hold" | "completed";

export interface Project {
  _id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  dueDate?: Date | null;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  _id: string;
  tenantId: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeUserId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
