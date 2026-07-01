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

interface Expense {
  _id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
}

const TONE: Record<Expense["status"], "amber" | "green" | "red"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

const EMPTY = { description: "", category: "Travel", amount: "" };

export function ExpensesClient() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/finance/expenses");
    if (res.ok) setExpenses((await res.json()).expenses ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/finance/expenses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        description: form.description,
        category: form.category,
        amount: Number(form.amount),
      }),
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

  async function decide(exp: Expense, action: "approve" | "reject") {
    await fetch(`/api/v1/finance/expenses/${exp._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Submit claims and approve reimbursements."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New expense"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              <Field label="Description">
                <Input
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Field>
              <Field label="Category">
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </Field>
              <Field label="Amount">
                <Input
                  required
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-3">
                <Button type="submit" loading={loading}>
                  Submit expense
                </Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Submit your first expense claim."
        />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((exp) => (
              <tr key={exp._id}>
                <Td className="font-medium text-slate-900">{exp.description}</Td>
                <Td>{exp.category}</Td>
                <Td>
                  {exp.currency} {exp.amount}
                </Td>
                <Td>
                  <Badge tone={TONE[exp.status]}>{exp.status}</Badge>
                </Td>
                <Td>
                  {exp.status === "pending" ? (
                    <span className="flex gap-3">
                      <button
                        onClick={() => decide(exp, "approve")}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => decide(exp, "reject")}
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
