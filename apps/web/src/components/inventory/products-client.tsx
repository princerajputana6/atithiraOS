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

interface Product {
  _id: string;
  sku: string;
  name: string;
  category?: string;
  unitPrice: number;
  currency: string;
  stockQty: number;
  reorderLevel: number;
}

const EMPTY = { sku: "", name: "", category: "", unitPrice: "", stockQty: "" };

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/inventory/products");
    if (res.ok) setProducts((await res.json()).products ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/inventory/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sku: form.sku,
        name: form.name,
        category: form.category,
        unitPrice: Number(form.unitPrice),
        stockQty: Number(form.stockQty || 0),
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

  async function move(product: Product, type: "in" | "out") {
    await fetch(`/api/v1/inventory/products/${product._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, qty: 1 }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Products, stock levels, and reorder alerts."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New product"}
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
              <Field label="SKU">
                <Input
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </Field>
              <Field label="Name">
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Category">
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </Field>
              <Field label="Unit price">
                <Input
                  required
                  type="number"
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm({ ...form, unitPrice: e.target.value })
                  }
                />
              </Field>
              <Field label="Opening stock">
                <Input
                  type="number"
                  value={form.stockQty}
                  onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit" loading={loading}>
                  Save product
                </Button>
              </div>
              {error && (
                <p className="sm:col-span-3 text-sm text-red-600">{error}</p>
              )}
            </form>
          </CardBody>
        </Card>
      )}

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to track stock."
        />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>SKU</Th>
              <Th>Name</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Adjust</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p._id}>
                <Td className="font-mono text-xs text-slate-600">{p.sku}</Td>
                <Td className="font-medium text-slate-900">{p.name}</Td>
                <Td>
                  {p.currency} {p.unitPrice}
                </Td>
                <Td>
                  <span className="mr-2">{p.stockQty}</span>
                  {p.stockQty <= p.reorderLevel && (
                    <Badge tone="red">low</Badge>
                  )}
                </Td>
                <Td>
                  <span className="flex gap-3">
                    <button
                      onClick={() => move(p, "in")}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => move(p, "out")}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      −1
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
