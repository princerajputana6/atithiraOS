"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Input,
  Field,
} from "@/components/ui";

type Stage = "qualified" | "proposal" | "negotiation" | "won" | "lost";

interface Deal {
  _id: string;
  title: string;
  amount: number;
  currency: string;
  stage: Stage;
}

const STAGES: { key: Stage; label: string; accent: string }[] = [
  { key: "qualified", label: "Qualified", accent: "border-t-blue-400" },
  { key: "proposal", label: "Proposal", accent: "border-t-indigo-400" },
  { key: "negotiation", label: "Negotiation", accent: "border-t-amber-400" },
  { key: "won", label: "Won", accent: "border-t-emerald-500" },
  { key: "lost", label: "Lost", accent: "border-t-slate-400" },
];

const EMPTY = { title: "", amount: "", currency: "INR" };

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function DealsClient() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/crm/deals");
    if (res.ok) setDeals((await res.json()).deals ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/crm/deals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        amount: Number(form.amount),
        currency: form.currency,
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

  async function move(deal: Deal, stage: Stage) {
    await fetch(`/api/v1/crm/deals/${deal._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    await load();
  }

  const total = deals
    .filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <PageHeader
        title="Deals"
        description={`Pipeline board · ${formatMoney(total, "INR")} won`}
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New deal"}
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
              <Field label="Title">
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              <Field label="Currency">
                <Input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-3">
                <Button type="submit" loading={loading}>
                  Create deal
                </Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);
          return (
            <div
              key={stage.key}
              className={`rounded-xl border border-t-4 border-slate-200 bg-slate-50/60 ${stage.accent}`}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-semibold text-slate-700">
                  {stage.label}
                </span>
                <span className="text-xs text-slate-400">
                  {stageDeals.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-2">
                {stageDeals.map((deal) => {
                  const idx = STAGES.findIndex((s) => s.key === deal.stage);
                  const next = STAGES[idx + 1];
                  return (
                    <div
                      key={deal._id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        {deal.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatMoney(deal.amount, deal.currency)}
                      </p>
                      {next && deal.stage !== "won" && deal.stage !== "lost" && (
                        <button
                          onClick={() => move(deal, next.key)}
                          className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          Move to {next.label} →
                        </button>
                      )}
                    </div>
                  );
                })}
                {stageDeals.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-slate-400">
                    Empty
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
