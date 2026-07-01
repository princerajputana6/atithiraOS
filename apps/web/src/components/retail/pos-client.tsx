"use client";

import { useEffect, useState } from "react";
import { PageHeader, Button, Card, CardBody, Select, Badge } from "@/components/ui";

interface Product {
  _id: string;
  sku: string;
  name: string;
  unitPrice: number;
  stockQty: number;
}
interface Sale {
  _id: string;
  number: string;
  total: number;
  currency: string;
  paymentMethod: string;
  items: { name: string; qty: number }[];
}

function money(a: number) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(a);
  } catch {
    return `₹${a}`;
  }
}

export function PosClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [method, setMethod] = useState("cash");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [p, s] = await Promise.all([fetch("/api/v1/inventory/products"), fetch("/api/v1/retail/sales")]);
    if (p.ok) setProducts((await p.json()).products ?? []);
    if (s.ok) setSales((await s.json()).sales ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  const lines = products.filter((p) => cart[p._id]).map((p) => ({ p, qty: cart[p._id] ?? 0 }));
  const subtotal = lines.reduce((s, l) => s + l.p.unitPrice * l.qty, 0);
  const total = subtotal + Math.round((subtotal * 18) / 100);

  function add(id: string, delta: number, max: number) {
    setCart((c) => {
      const qty = Math.min(max, Math.max(0, (c[id] ?? 0) + delta));
      const next = { ...c, [id]: qty };
      if (qty === 0) delete next[id];
      return next;
    });
  }

  async function checkout() {
    setError(null);
    if (lines.length === 0) {
      setError("Scan or add at least one item.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/v1/retail/sales", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: lines.map((l) => ({ productId: l.p._id, qty: l.qty })), paymentMethod: method }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Checkout failed");
      return;
    }
    setCart({});
    await load();
  }

  return (
    <div>
      <PageHeader title="Point of Sale" description="Ring up a sale — stock is deducted automatically from Inventory." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Products</h2>
            {products.length === 0 ? (
              <p className="text-sm text-slate-500">Add products in Inventory first.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {products.map((p) => (
                  <div key={p._id} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{money(p.unitPrice)} · {p.stockQty} in stock</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => add(p._id, -1, p.stockQty)} className="h-6 w-6 rounded bg-slate-100 text-slate-600">−</button>
                      <span className="w-5 text-center text-sm">{cart[p._id] ?? 0}</span>
                      <button onClick={() => add(p._id, 1, p.stockQty)} disabled={p.stockQty === 0} className="h-6 w-6 rounded bg-brand-100 text-brand-700 disabled:opacity-40">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Cart</h2>
            {lines.length === 0 ? (
              <p className="text-sm text-slate-400">No items yet.</p>
            ) : (
              <div className="space-y-1">
                {lines.map((l) => (
                  <div key={l.p._id} className="flex justify-between text-sm">
                    <span className="text-slate-700">{l.qty}× {l.p.name}</span>
                    <span className="text-slate-900">{money(l.p.unitPrice * l.qty)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between text-slate-500"><span>GST 18%</span><span>{money(total - subtotal)}</span></div>
              <div className="mt-1 flex justify-between font-semibold text-slate-900"><span>Total</span><span>{money(total)}</span></div>
            </div>
            <Select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-3">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </Select>
            <Button onClick={checkout} loading={busy} className="mt-3 w-full">Charge {money(total)}</Button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </CardBody>
        </Card>
      </div>

      {sales.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent sales</h2>
          <div className="flex flex-col gap-2">
            {sales.slice().reverse().slice(0, 8).map((s) => (
              <Card key={s._id}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-900">{s.number}</span>
                    <span className="ml-2 text-sm text-slate-500">{s.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="gray">{s.paymentMethod}</Badge>
                    <span className="font-semibold text-slate-900">{money(s.total)}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
