"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Field,
  Table,
  Th,
  Td,
  Badge,
  EmptyState,
} from "@/components/ui";

interface Item {
  _id: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  available: boolean;
}

const CATEGORIES = ["starters", "mains", "breads", "rice", "desserts", "beverages", "other"];
const EMPTY = { name: "", category: "mains", price: "", isVeg: "yes" };

export function MenuClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/restaurant/menu");
    if (res.ok) setItems((await res.json()).items ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/restaurant/menu", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        isVeg: form.isVeg === "yes",
      }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    setForm(EMPTY);
    setShowForm(false);
    await load();
  }

  async function toggle(item: Item) {
    await fetch(`/api/v1/restaurant/menu/${item._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    await load();
  }

  async function remove(item: Item) {
    await fetch(`/api/v1/restaurant/menu/${item._id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Menu"
        description="Your dishes, prices, and availability."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add dish"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={add} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Field label="Dish name">
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Category">
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Price (₹)">
                <Input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </Field>
              <Field label="Veg?">
                <Select value={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.value })}>
                  <option value="yes">Veg</option>
                  <option value="no">Non-veg</option>
                </Select>
              </Field>
              <div className="sm:col-span-4">
                <Button type="submit">Save dish</Button>
                {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState title="No dishes yet" description="Add your first dish to build the menu." />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Dish</Th>
              <Th>Category</Th>
              <Th>Type</Th>
              <Th>Price</Th>
              <Th>Available</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it) => (
              <tr key={it._id}>
                <Td className="font-medium text-slate-900">{it.name}</Td>
                <Td className="capitalize">{it.category}</Td>
                <Td>
                  <Badge tone={it.isVeg ? "green" : "red"}>{it.isVeg ? "Veg" : "Non-veg"}</Badge>
                </Td>
                <Td>₹{it.price}</Td>
                <Td>
                  <Badge tone={it.available ? "green" : "gray"}>
                    {it.available ? "Available" : "86'd"}
                  </Badge>
                </Td>
                <Td>
                  <span className="flex gap-3">
                    <button onClick={() => toggle(it)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      {it.available ? "Mark out" : "Mark in"}
                    </button>
                    <button onClick={() => remove(it)} className="text-sm font-medium text-red-600 hover:text-red-700">
                      Delete
                    </button>
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
