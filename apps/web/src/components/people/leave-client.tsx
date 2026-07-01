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
  Table,
  Th,
  Td,
  Badge,
  EmptyState,
} from "@/components/ui";

interface Employee {
  _id: string;
  name: string;
}
interface Leave {
  _id: string;
  employeeId: string;
  type: string;
  fromDate: string;
  toDate: string;
  status: "pending" | "approved" | "rejected";
}

const TONE: Record<Leave["status"], "amber" | "green" | "red"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

const EMPTY = { employeeId: "", type: "casual", fromDate: "", toDate: "" };

export function LeaveClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leave, setLeave] = useState<Leave[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [empRes, leaveRes] = await Promise.all([
      fetch("/api/v1/people/employees"),
      fetch("/api/v1/people/leave"),
    ]);
    if (empRes.ok) setEmployees((await empRes.json()).employees ?? []);
    if (leaveRes.ok) setLeave((await leaveRes.json()).leave ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  const nameFor = (id: string) =>
    employees.find((e) => e._id === id)?.name ?? "—";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/people/leave", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    setForm(EMPTY);
    setShowForm(false);
    await load();
  }

  async function decide(l: Leave, action: "approve" | "reject") {
    await fetch(`/api/v1/people/leave/${l._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Leave"
        description="Request time off and approve pending requests."
        action={
          <Button
            onClick={() => setShowForm((s) => !s)}
            disabled={employees.length === 0}
          >
            {showForm ? "Cancel" : "+ Request leave"}
          </Button>
        }
      />

      {employees.length === 0 && (
        <p className="mb-4 text-sm text-slate-500">
          Add an employee first to request leave.
        </p>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-3 sm:grid-cols-4"
            >
              <Field label="Employee">
                <Select
                  required
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm({ ...form, employeeId: e.target.value })
                  }
                >
                  <option value="">Select…</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Type">
                <Select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="earned">Earned</option>
                </Select>
              </Field>
              <Field label="From">
                <Input
                  required
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                />
              </Field>
              <Field label="To">
                <Input
                  required
                  type="date"
                  value={form.toDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-4">
                <Button type="submit" loading={loading}>
                  Submit request
                </Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {leave.length === 0 ? (
        <EmptyState title="No leave requests yet" />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Employee</Th>
              <Th>Type</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leave.map((l) => (
              <tr key={l._id}>
                <Td className="font-medium text-slate-900">
                  {nameFor(l.employeeId)}
                </Td>
                <Td className="capitalize">{l.type}</Td>
                <Td>{l.fromDate}</Td>
                <Td>{l.toDate}</Td>
                <Td>
                  <Badge tone={TONE[l.status]}>{l.status}</Badge>
                </Td>
                <Td>
                  {l.status === "pending" ? (
                    <span className="flex gap-3">
                      <button
                        onClick={() => decide(l, "approve")}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => decide(l, "reject")}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Reject
                      </button>
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
