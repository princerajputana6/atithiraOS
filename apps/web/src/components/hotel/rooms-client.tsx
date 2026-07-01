"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PageHeader, Button, Card, CardBody, Input, Select, Field, Table, Th, Td, Badge, EmptyState } from "@/components/ui";

interface Room {
  _id: string;
  number: string;
  type: string;
  ratePerNight: number;
  status: "available" | "occupied" | "maintenance";
}
const TONE: Record<Room["status"], "green" | "amber" | "gray"> = { available: "green", occupied: "amber", maintenance: "gray" };
const EMPTY = { number: "", type: "standard", ratePerNight: "" };

export function RoomsClient() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/v1/hotel/rooms");
    if (res.ok) setRooms((await res.json()).rooms ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/v1/hotel/rooms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ number: form.number, type: form.type, ratePerNight: Number(form.ratePerNight) }),
    });
    if (res.ok) {
      setForm(EMPTY);
      setShowForm(false);
      await load();
    }
  }

  return (
    <div>
      <PageHeader title="Rooms" description="Your room inventory and rates." action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ Add room"}</Button>} />
      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={add} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Room number"><Input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></Field>
              <Field label="Type">
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </Select>
              </Field>
              <Field label="Rate / night (₹)"><Input required type="number" value={form.ratePerNight} onChange={(e) => setForm({ ...form, ratePerNight: e.target.value })} /></Field>
              <div className="sm:col-span-3"><Button type="submit">Save room</Button></div>
            </form>
          </CardBody>
        </Card>
      )}
      {rooms.length === 0 ? (
        <EmptyState title="No rooms yet" description="Add rooms to start taking bookings." />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50"><tr><Th>Room</Th><Th>Type</Th><Th>Rate</Th><Th>Status</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((r) => (
              <tr key={r._id}>
                <Td className="font-medium text-slate-900">{r.number}</Td>
                <Td className="capitalize">{r.type}</Td>
                <Td>₹{r.ratePerNight}</Td>
                <Td><Badge tone={TONE[r.status]}>{r.status}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
