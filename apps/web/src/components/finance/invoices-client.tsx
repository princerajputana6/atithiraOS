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

interface Invoice {
  _id: string;
  number: string;
  customerName: string;
  total: number;
  currency: string;
  taxRate: number;
  status: "draft" | "sent" | "paid" | "void";
}

const TONE: Record<Invoice["status"], "gray" | "blue" | "green" | "red"> = {
  draft: "gray",
  sent: "blue",
  paid: "green",
  void: "red",
};

const EMPTY = { customerName: "", amount: "", taxRate: "18" };

function money(a: number, c: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: c,
      maximumFractionDigits: 0,
    }).format(a);
  } catch {
    return `${c} ${a}`;
  }
}

export function InvoicesClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/finance/invoices");
    if (res.ok) setInvoices((await res.json()).invoices ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/finance/invoices", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customerName: form.customerName,
        amount: Number(form.amount),
        taxRate: Number(form.taxRate),
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

  async function pay(inv: Invoice) {
    await fetch(`/api/v1/finance/invoices/${inv._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "pay" }),
    });
    await load();
  }

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidCount = invoices.filter((inv) => inv.status === "paid").length;
  const openCount = invoices.filter((inv) => inv.status !== "paid" && inv.status !== "void").length;

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Bill customers with automatic GST and record payments."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New invoice"}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total billed</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{money(totalBilled, "INR")}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Open invoices</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{openCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Paid</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{paidCount}</p>
          </CardBody>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6 overflow-hidden">
          <CardBody>
            <div className="mb-4 rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">New invoice</p>
              <p className="mt-0.5 text-xs text-slate-600">Create a GST-inclusive invoice and track payment status from the list below.</p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              <Field label="Customer name">
                <Input
                  required
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                />
              </Field>
              <Field label="Amount (pre-tax)">
                <Input
                  required
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </Field>
              <Field label="GST %">
                <Input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-3">
                <Button type="submit" loading={loading}>
                  Create invoice
                </Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first invoice to start billing customers."
        />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Number</Th>
              <Th>Customer</Th>
              <Th>Total (incl. GST)</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <Td className="font-medium text-slate-900">{inv.number}</Td>
                <Td>{inv.customerName}</Td>
                <Td>{money(inv.total, inv.currency)}</Td>
                <Td>
                  <Badge tone={TONE[inv.status]}>{inv.status}</Badge>
                </Td>
                <Td>
                  {inv.status !== "paid" ? (
                    <button
                      onClick={() => pay(inv)}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Mark paid
                    </button>
                  ) : (
                    <span className="text-sm text-slate-400">Paid</span>
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
