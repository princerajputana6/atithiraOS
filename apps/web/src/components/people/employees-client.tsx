"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Input,
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
  email?: string;
  jobTitle?: string;
  department?: string;
  status: "active" | "terminated";
}

const EMPTY = { name: "", email: "", jobTitle: "", department: "" };

export function EmployeesClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/people/employees");
    if (res.ok) setEmployees((await res.json()).employees ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/people/employees", {
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

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Your team's records and roles."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add employee"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <Field label="Name">
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Job title">
                <Input
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Department">
                <Input
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit" loading={loading}>
                  Save employee
                </Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {employees.length === 0 ? (
        <EmptyState
          title="No employees yet"
          description="Add your first team member to get started."
        />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Name</Th>
              <Th>Job title</Th>
              <Th>Department</Th>
              <Th>Email</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr key={emp._id}>
                <Td className="font-medium text-slate-900">{emp.name}</Td>
                <Td>{emp.jobTitle ?? "—"}</Td>
                <Td>{emp.department ?? "—"}</Td>
                <Td>{emp.email ?? "—"}</Td>
                <Td>
                  <Badge tone={emp.status === "active" ? "green" : "gray"}>
                    {emp.status}
                  </Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
