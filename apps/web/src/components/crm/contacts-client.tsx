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
  EmptyState,
} from "@/components/ui";

interface Contact {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

const EMPTY = { name: "", email: "", phone: "", company: "" };

export function ContactsClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/crm/contacts");
    if (res.ok) setContacts((await res.json()).contacts ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/crm/contacts", {
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

  const withEmail = contacts.filter((contact) => contact.email).length;
  const withPhone = contacts.filter((contact) => contact.phone).length;

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Everyone your business talks to, in one place."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New contact"}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Contacts</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{contacts.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">With email</p>
            <p className="mt-2 text-2xl font-semibold text-brand-700">{withEmail}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">With phone</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{withPhone}</p>
          </CardBody>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <div className="mb-4 rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">New contact</p>
              <p className="mt-0.5 text-xs text-slate-600">Keep customer identity, company, and reachability in one shared record.</p>
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
              <Field label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit" loading={loading}>
                  Save contact
                </Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          description="Add your first contact to start building your customer base."
        />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Name</Th>
              <Th>Company</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((c) => (
              <tr key={c._id}>
                <Td className="font-medium text-slate-900">{c.name}</Td>
                <Td>{c.company ?? "—"}</Td>
                <Td>{c.email ?? "—"}</Td>
                <Td>{c.phone ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
