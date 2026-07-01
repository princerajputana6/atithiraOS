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

interface Reservation {
  _id: string;
  guestName: string;
  phone?: string;
  partySize: number;
  date: string;
  time: string;
  status: "booked" | "seated" | "cancelled" | "no_show";
}

const TONE: Record<Reservation["status"], "blue" | "green" | "red" | "gray"> = {
  booked: "blue",
  seated: "green",
  cancelled: "red",
  no_show: "gray",
};

const EMPTY = { guestName: "", phone: "", partySize: "2", date: "", time: "" };

export function ReservationsClient() {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/restaurant/reservations");
    if (res.ok) setRows((await res.json()).reservations ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/restaurant/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    setForm(EMPTY);
    setShowForm(false);
    await load();
  }

  async function setStatus(r: Reservation, status: string) {
    await fetch(`/api/v1/restaurant/reservations/${r._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Reservations"
        description="Table bookings and guest arrivals."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New booking"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={add} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              <Field label="Guest name">
                <Input required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Party size">
                <Input type="number" value={form.partySize} onChange={(e) => setForm({ ...form, partySize: e.target.value })} />
              </Field>
              <Field label="Date">
                <Input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <Field label="Time">
                <Input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </Field>
              <div className="sm:col-span-5">
                <Button type="submit">Book table</Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No reservations yet" />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Guest</Th>
              <Th>Party</Th>
              <Th>Date</Th>
              <Th>Time</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r._id}>
                <Td className="font-medium text-slate-900">
                  {r.guestName}
                  {r.phone ? <span className="ml-2 text-xs text-slate-400">{r.phone}</span> : null}
                </Td>
                <Td>{r.partySize}</Td>
                <Td>{r.date}</Td>
                <Td>{r.time}</Td>
                <Td>
                  <Badge tone={TONE[r.status]}>{r.status.replace("_", " ")}</Badge>
                </Td>
                <Td>
                  {r.status === "booked" ? (
                    <span className="flex gap-3">
                      <button onClick={() => setStatus(r, "seated")} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        Seat
                      </button>
                      <button onClick={() => setStatus(r, "cancelled")} className="text-sm font-medium text-red-600 hover:text-red-700">
                        Cancel
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
