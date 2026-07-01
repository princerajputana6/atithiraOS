"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PageHeader, Button, Card, CardBody, Input, Select, Field, Table, Th, Td, Badge, EmptyState } from "@/components/ui";

interface Patient {
  _id: string;
  name: string;
}
interface Appointment {
  _id: string;
  patientName: string;
  practitioner?: string;
  date: string;
  time: string;
  reason?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
}
const TONE: Record<Appointment["status"], "blue" | "green" | "red" | "gray"> = {
  scheduled: "blue",
  completed: "green",
  cancelled: "red",
  no_show: "gray",
};
const EMPTY = { patientId: "", practitioner: "", date: "", time: "", reason: "" };

export function AppointmentsClient() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rows, setRows] = useState<Appointment[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [p, a] = await Promise.all([fetch("/api/v1/clinic/patients"), fetch("/api/v1/clinic/appointments")]);
    if (p.ok) setPatients((await p.json()).patients ?? []);
    if (a.ok) setRows((await a.json()).appointments ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/clinic/appointments", {
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

  async function setStatus(a: Appointment, status: string) {
    await fetch(`/api/v1/clinic/appointments/${a._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader title="Appointments" description="Schedule and track patient visits." action={<Button onClick={() => setShowForm((s) => !s)} disabled={patients.length === 0}>{showForm ? "Cancel" : "+ New appointment"}</Button>} />
      {patients.length === 0 && <p className="mb-4 text-sm text-slate-500">Add a patient first.</p>}
      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={add} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              <Field label="Patient">
                <Select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">Select…</option>
                  {patients.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field label="Practitioner"><Input value={form.practitioner} onChange={(e) => setForm({ ...form, practitioner: e.target.value })} /></Field>
              <Field label="Date"><Input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Time"><Input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
              <Field label="Reason"><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
              <div className="sm:col-span-5"><Button type="submit">Schedule</Button>{error && <span className="ml-3 text-sm text-red-600">{error}</span>}</div>
            </form>
          </CardBody>
        </Card>
      )}
      {rows.length === 0 ? (
        <EmptyState title="No appointments yet" />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50"><tr><Th>Patient</Th><Th>Practitioner</Th><Th>When</Th><Th>Reason</Th><Th>Status</Th><Th>Action</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((a) => (
              <tr key={a._id}>
                <Td className="font-medium text-slate-900">{a.patientName}</Td>
                <Td>{a.practitioner ?? "—"}</Td>
                <Td>{a.date} {a.time}</Td>
                <Td>{a.reason ?? "—"}</Td>
                <Td><Badge tone={TONE[a.status]}>{a.status.replace("_", " ")}</Badge></Td>
                <Td>{a.status === "scheduled" ? <span className="flex gap-3"><button onClick={() => setStatus(a, "completed")} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Complete</button><button onClick={() => setStatus(a, "cancelled")} className="text-sm font-medium text-red-600 hover:text-red-700">Cancel</button></span> : <span className="text-sm text-slate-400">—</span>}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
