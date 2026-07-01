"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PageHeader, Button, Card, CardBody, Input, Select, Field, Table, Th, Td, Badge, EmptyState } from "@/components/ui";

interface Room {
  _id: string;
  number: string;
  status: string;
}
interface Booking {
  _id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  currency: string;
  status: "booked" | "checked_in" | "checked_out" | "cancelled";
}
const TONE: Record<Booking["status"], "blue" | "green" | "gray" | "red"> = {
  booked: "blue",
  checked_in: "green",
  checked_out: "gray",
  cancelled: "red",
};
const NEXT: Record<Booking["status"], Booking["status"] | null> = {
  booked: "checked_in",
  checked_in: "checked_out",
  checked_out: null,
  cancelled: null,
};
const EMPTY = { guestName: "", phone: "", roomId: "", checkIn: "", checkOut: "" };

export function BookingsClient() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rows, setRows] = useState<Booking[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [r, b] = await Promise.all([fetch("/api/v1/hotel/rooms"), fetch("/api/v1/hotel/bookings")]);
    if (r.ok) setRooms(((await r.json()).rooms ?? []).filter((x: Room) => x.status === "available"));
    if (b.ok) setRows((await b.json()).bookings ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/hotel/bookings", {
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

  async function advance(b: Booking) {
    const next = NEXT[b.status];
    if (!next) return;
    await fetch(`/api/v1/hotel/bookings/${b._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader title="Bookings" description="Guest bookings and check-ins." action={<Button onClick={() => setShowForm((s) => !s)} disabled={rooms.length === 0}>{showForm ? "Cancel" : "+ New booking"}</Button>} />
      {rooms.length === 0 && <p className="mb-4 text-sm text-slate-500">Add an available room first.</p>}
      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={add} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              <Field label="Guest name"><Input required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Room">
                <Select required value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
                  <option value="">Select…</option>
                  {rooms.map((r) => <option key={r._id} value={r._id}>Room {r.number}</option>)}
                </Select>
              </Field>
              <Field label="Check-in"><Input required type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} /></Field>
              <Field label="Check-out"><Input required type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></Field>
              <div className="sm:col-span-5"><Button type="submit">Book room</Button>{error && <span className="ml-3 text-sm text-red-600">{error}</span>}</div>
            </form>
          </CardBody>
        </Card>
      )}
      {rows.length === 0 ? (
        <EmptyState title="No bookings yet" />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50"><tr><Th>Guest</Th><Th>Room</Th><Th>Dates</Th><Th>Total</Th><Th>Status</Th><Th>Action</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((b) => (
              <tr key={b._id}>
                <Td className="font-medium text-slate-900">{b.guestName}</Td>
                <Td>Room {b.roomNumber}</Td>
                <Td>{b.checkIn} → {b.checkOut} ({b.nights}n)</Td>
                <Td>₹{b.total}</Td>
                <Td><Badge tone={TONE[b.status]}>{b.status.replace("_", " ")}</Badge></Td>
                <Td>{NEXT[b.status] ? <button onClick={() => advance(b)} className="text-sm font-medium text-brand-600 hover:text-brand-700">{b.status === "booked" ? "Check in →" : "Check out →"}</button> : <span className="text-sm text-slate-400">—</span>}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
