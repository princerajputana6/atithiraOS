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

interface Lead {
  _id: string;
  name: string;
  email?: string;
  company?: string;
  source?: string;
  status: "new" | "contacted" | "qualified" | "lost";
  score: number;
}

const STATUS_TONE: Record<Lead["status"], "blue" | "amber" | "green" | "red"> = {
  new: "blue",
  contacted: "amber",
  qualified: "green",
  lost: "red",
};

const EMPTY = { name: "", email: "", company: "", source: "" };

export function LeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/crm/leads");
    if (res.ok) setLeads((await res.json()).leads ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/crm/leads", {
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

  const qualified = leads.filter((lead) => lead.status === "qualified").length;
  const avgScore = leads.length
    ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length)
    : 0;

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Capture and qualify prospects before they become deals."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New lead"}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total leads</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{leads.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Qualified</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{qualified}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Avg score</p>
            <p className="mt-2 text-2xl font-semibold text-brand-700">{avgScore}</p>
          </CardBody>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <div className="mb-4 rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">Capture a lead</p>
              <p className="mt-0.5 text-xs text-slate-600">Add source and company context so follow-up feels less like detective work.</p>
            </div>
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
              <Field label="Company">
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Source">
                <Input
                  placeholder="Website, referral, ad…"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit" loading={loading}>
                  Save lead
                </Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {leads.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Capture your first lead to start filling the pipeline."
        />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Name</Th>
              <Th>Company</Th>
              <Th>Source</Th>
              <Th>Status</Th>
              <Th>Score</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l) => (
              <tr key={l._id}>
                <Td className="font-medium text-slate-900">{l.name}</Td>
                <Td>{l.company ?? "—"}</Td>
                <Td>{l.source ?? "—"}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge>
                </Td>
                <Td>{l.score}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
