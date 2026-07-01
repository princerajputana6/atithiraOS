"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PageHeader, Button, Card, CardBody, Input, Field, Badge, EmptyState } from "@/components/ui";

interface TableRow {
  _id: string;
  label: string;
  seats: number;
  status: "free" | "occupied" | "reserved";
  orderUrl: string;
  qrDataUrl: string;
}

const TONE: Record<TableRow["status"], "green" | "amber" | "blue"> = {
  free: "green",
  occupied: "amber",
  reserved: "blue",
};

export function TablesClient() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [form, setForm] = useState({ label: "", seats: "4" });
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/v1/restaurant/tables");
    if (res.ok) setTables((await res.json()).tables ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/v1/restaurant/tables", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: form.label, seats: Number(form.seats) }),
    });
    if (res.ok) {
      setForm({ label: "", seats: "4" });
      setShowForm(false);
      await load();
    }
  }

  return (
    <div>
      <PageHeader
        title="Tables & QR"
        description="Each table has a QR code — guests scan it to open the menu and order."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add table"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={add} className="flex flex-wrap items-end gap-3">
              <div className="w-40">
                <Field label="Table label">
                  <Input required placeholder="T1" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                </Field>
              </div>
              <div className="w-28">
                <Field label="Seats">
                  <Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
                </Field>
              </div>
              <Button type="submit">Create table</Button>
            </form>
          </CardBody>
        </Card>
      )}

      {tables.length === 0 ? (
        <EmptyState title="No tables yet" description="Add tables to generate their QR codes." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <Card key={t._id}>
              <CardBody className="flex flex-col items-center text-center">
                <div className="flex w-full items-center justify-between">
                  <span className="text-base font-semibold text-slate-900">{t.label}</span>
                  <Badge tone={TONE[t.status]}>{t.status}</Badge>
                </div>
                <img src={t.qrDataUrl} alt={`QR for ${t.label}`} className="my-3 h-40 w-40 rounded-lg border border-slate-200" />
                <p className="text-xs text-slate-500">{t.seats} seats</p>
                <a
                  href={t.orderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 break-all text-[11px] text-brand-600 hover:underline"
                >
                  {t.orderUrl}
                </a>
                <button
                  onClick={() => window.print()}
                  className="mt-3 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Print QR
                </button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
