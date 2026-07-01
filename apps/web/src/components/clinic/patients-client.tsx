"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PageHeader, Button, Card, CardBody, Input, Select, Field, Table, Th, Td, EmptyState } from "@/components/ui";

interface Patient {
  _id: string;
  name: string;
  phone?: string;
  gender?: string;
  age?: number;
}
const EMPTY = { name: "", phone: "", gender: "male", age: "" };

export function PatientsClient() {
  const [rows, setRows] = useState<Patient[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/v1/clinic/patients");
    if (res.ok) setRows((await res.json()).patients ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/v1/clinic/patients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(EMPTY);
      setShowForm(false);
      await load();
    }
  }

  return (
    <div>
      <PageHeader title="Patients" description="Your patient register." action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ Add patient"}</Button>} />
      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={add} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Gender">
                <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
              <Field label="Age"><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></Field>
              <div className="sm:col-span-4"><Button type="submit">Save patient</Button></div>
            </form>
          </CardBody>
        </Card>
      )}
      {rows.length === 0 ? (
        <EmptyState title="No patients yet" />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50"><tr><Th>Name</Th><Th>Phone</Th><Th>Gender</Th><Th>Age</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p._id}>
                <Td className="font-medium text-slate-900">{p.name}</Td>
                <Td>{p.phone ?? "—"}</Td>
                <Td className="capitalize">{p.gender ?? "—"}</Td>
                <Td>{p.age ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
