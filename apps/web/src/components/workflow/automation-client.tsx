"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Field,
  Badge,
  EmptyState,
} from "@/components/ui";

interface Rule {
  _id: string;
  name: string;
  triggerEvent: string;
  enabled: boolean;
  actions: { type: string; config: Record<string, string> }[];
}

const TRIGGERS = [
  "crm/lead.created",
  "crm/deal.won",
  "finance/invoice.paid",
  "finance/expense.approved",
  "people/employee.hired",
  "people/leave.requested",
  "inventory/stock.low",
  "projects/task.completed",
];

const EMPTY = {
  name: "",
  triggerEvent: "finance/invoice.paid",
  actionType: "notify",
  message: "Invoice {{number}} was paid ({{total}} {{currency}})",
  projectId: "",
  taskTitle: "Follow up on {{number}}",
};

export function AutomationClient() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/workflow/rules");
    if (res.ok) setRules((await res.json()).rules ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const actions =
      form.actionType === "notify"
        ? [{ type: "notify", config: { message: form.message } }]
        : [
            {
              type: "create_task",
              config: { projectId: form.projectId, title: form.taskTitle },
            },
          ];
    const res = await fetch("/api/v1/workflow/rules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        triggerEvent: form.triggerEvent,
        actions,
      }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    setForm(EMPTY);
    setShowForm(false);
    await load();
  }

  async function toggle(rule: Rule) {
    await fetch(`/api/v1/workflow/rules/${rule._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: !rule.enabled }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Automation"
        description="No-code rules — when an event happens, run an action."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New rule"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Rule name">
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Field>
                <Field label="When this event fires">
                  <Select
                    value={form.triggerEvent}
                    onChange={(e) =>
                      setForm({ ...form, triggerEvent: e.target.value })
                    }
                  >
                    {TRIGGERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Do this action">
                  <Select
                    value={form.actionType}
                    onChange={(e) =>
                      setForm({ ...form, actionType: e.target.value })
                    }
                  >
                    <option value="notify">Send in-app notification</option>
                    <option value="create_task">Create a project task</option>
                  </Select>
                </Field>
                {form.actionType === "notify" ? (
                  <Field label="Notification message">
                    <Input
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                    />
                  </Field>
                ) : (
                  <>
                    <Field label="Project ID">
                      <Input
                        value={form.projectId}
                        onChange={(e) =>
                          setForm({ ...form, projectId: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Task title">
                      <Input
                        value={form.taskTitle}
                        onChange={(e) =>
                          setForm({ ...form, taskTitle: e.target.value })
                        }
                      />
                    </Field>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Tip: use <code>{"{{field}}"}</code> placeholders (e.g.{" "}
                <code>{"{{number}}"}</code>) to pull values from the event.
              </p>
              <div>
                <Button type="submit">Create rule</Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {rules.length === 0 ? (
        <EmptyState
          title="No automation rules yet"
          description="Create a rule to automate work across modules — no code required."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((rule) => (
            <Card key={rule._id}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{rule.name}</p>
                    <Badge tone={rule.enabled ? "green" : "gray"}>
                      {rule.enabled ? "active" : "paused"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    On <code className="text-brand-600">{rule.triggerEvent}</code>{" "}
                    → {rule.actions.map((a) => a.type).join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => toggle(rule)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {rule.enabled ? "Pause" : "Activate"}
                </button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
