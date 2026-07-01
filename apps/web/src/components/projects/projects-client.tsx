"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Input,
  Field,
  EmptyState,
} from "@/components/ui";

type Status = "todo" | "in_progress" | "done";

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
}
interface Task {
  _id: string;
  projectId: string;
  title: string;
  status: Status;
  priority: string;
}

const COLUMNS: { key: Status; label: string; accent: string }[] = [
  { key: "todo", label: "To do", accent: "border-t-slate-400" },
  { key: "in_progress", label: "In progress", accent: "border-t-amber-400" },
  { key: "done", label: "Done", accent: "border-t-emerald-500" },
];

const NEXT: Record<Status, Status | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

export function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projForm, setProjForm] = useState({ name: "", description: "" });
  const [taskTitle, setTaskTitle] = useState("");
  const [showProjForm, setShowProjForm] = useState(false);

  async function loadProjects() {
    const res = await fetch("/api/v1/projects");
    if (res.ok) {
      const list = (await res.json()).projects ?? [];
      setProjects(list);
      if (!activeId && list.length) setActiveId(list[0]._id);
    }
  }
  async function loadTasks(projectId: string) {
    const res = await fetch(`/api/v1/projects/tasks?projectId=${projectId}`);
    if (res.ok) setTasks((await res.json()).tasks ?? []);
  }

  useEffect(() => {
    void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (activeId) void loadTasks(activeId);
  }, [activeId]);

  async function addProject(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/v1/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(projForm),
    });
    if (res.ok) {
      setProjForm({ name: "", description: "" });
      setShowProjForm(false);
      await loadProjects();
    }
  }

  async function addTask(e: FormEvent) {
    e.preventDefault();
    if (!activeId || !taskTitle) return;
    await fetch("/api/v1/projects/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId: activeId, title: taskTitle }),
    });
    setTaskTitle("");
    await loadTasks(activeId);
  }

  async function move(task: Task) {
    const next = NEXT[task.status];
    if (!next) return;
    await fetch(`/api/v1/projects/tasks/${task._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (activeId) await loadTasks(activeId);
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Plan work with projects and a kanban task board."
        action={
          <Button onClick={() => setShowProjForm((s) => !s)}>
            {showProjForm ? "Cancel" : "+ New project"}
          </Button>
        }
      />

      {showProjForm && (
        <Card className="mb-6">
          <CardBody>
            <form
              onSubmit={addProject}
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              <Field label="Project name">
                <Input
                  required
                  value={projForm.name}
                  onChange={(e) =>
                    setProjForm({ ...projForm, name: e.target.value })
                  }
                />
              </Field>
              <Field label="Description">
                <Input
                  value={projForm.description}
                  onChange={(e) =>
                    setProjForm({ ...projForm, description: e.target.value })
                  }
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit">Create project</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start planning tasks."
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {projects.map((p) => (
              <button
                key={p._id}
                onClick={() => setActiveId(p._id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  activeId === p._id
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <form onSubmit={addTask} className="mb-5 flex gap-2">
            <Input
              placeholder="Add a task…"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="secondary">
              Add task
            </Button>
          </form>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div
                  key={col.key}
                  className={`rounded-xl border border-t-4 border-slate-200 bg-slate-50/60 ${col.accent}`}
                >
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-sm font-semibold text-slate-700">
                      {col.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {colTasks.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-2">
                    {colTasks.map((task) => (
                      <div
                        key={task._id}
                        className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <p className="text-sm text-slate-800">{task.title}</p>
                        {NEXT[task.status] && (
                          <button
                            onClick={() => move(task)}
                            className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700"
                          >
                            Move →
                          </button>
                        )}
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <p className="px-1 py-4 text-center text-xs text-slate-400">
                        Empty
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
