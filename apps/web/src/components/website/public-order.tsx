"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { SiteBlockItem } from "@atithira/types";
import { payWithRazorpay } from "@/components/website/razorpay";

interface Product {
  name: string;
  price?: string;
  description?: string;
  pricePaise: number;
}

function toPaise(display?: string): number {
  if (!display) return 0;
  const n = parseFloat(display.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function PublicOrder({
  slug,
  businessName,
  products,
}: {
  slug: string;
  businessName: string;
  products: Product[];
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery" | "dine-in">("pickup");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const totalPaise = useMemo(
    () => products.reduce((sum, p) => sum + p.pricePaise * (qty[p.name] ?? 0), 0),
    [qty, products],
  );
  const itemCount = Object.values(qty).reduce((a, b) => a + b, 0);

  function bump(nameKey: string, delta: number) {
    setQty((q) => {
      const next = Math.max(0, (q[nameKey] ?? 0) + delta);
      return { ...q, [nameKey]: next };
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (itemCount === 0) {
      setError("Add at least one item to your order.");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const items = products.filter((p) => (qty[p.name] ?? 0) > 0).map((p) => ({ title: p.name, qty: qty[p.name] }));
      const res = await fetch(`/api/public/website/${slug}/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items, fulfilment, customerName: name, customerPhone: phone, customerEmail: email, address, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed");

      if (data.payment) {
        const handshake = await payWithRazorpay({
          intent: data.payment,
          businessName,
          description: `Order — ${itemCount} item(s)`,
          prefill: { name, email, contact: phone },
        });
        if (!handshake) {
          setError("Payment was not completed. Your order is saved as pending.");
          setState("error");
          return;
        }
        const verify = await fetch(`/api/public/website/${slug}/payments/verify`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind: "order", ...handshake }),
        });
        if (!verify.ok) throw new Error("Payment could not be verified");
      }
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm text-emerald-800">
        Order received — thank you! We&apos;ll have it ready shortly.
      </div>
    );
  }

  const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200">
        {products.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
              {p.description && <p className="truncate text-xs text-slate-500">{p.description}</p>}
              <p className="text-xs font-semibold text-indigo-600">{p.price ?? "—"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => bump(p.name, -1)} className="h-7 w-7 rounded-full border border-slate-300 text-slate-600">−</button>
              <span className="w-5 text-center text-sm">{qty[p.name] ?? 0}</span>
              <button type="button" onClick={() => bump(p.name, 1)} className="h-7 w-7 rounded-full border border-slate-300 text-slate-600">+</button>
            </div>
          </div>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-left text-sm">
        <span className="font-medium text-slate-700">Fulfilment</span>
        <select value={fulfilment} onChange={(e) => setFulfilment(e.target.value as typeof fulfilment)} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900">
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
          <option value="dine-in">Dine-in</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Your name"><input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
        <Field label="Phone"><input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
      </div>
      {fulfilment === "delivery" && (
        <Field label="Delivery address"><input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
      )}
      <Field label="Notes (optional)"><input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending" || itemCount === 0}
        className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {state === "sending" ? "Please wait…" : totalPaise > 0 ? `Place order · ${rupees(totalPaise)}` : "Place order"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-left text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

/** Maps a menu block's items to the Product shape the order form needs. */
export function productsFromItems(items: SiteBlockItem[] | undefined): Product[] {
  return (items ?? [])
    .filter((it) => it.title)
    .map((it) => ({ name: it.title!, price: it.heading, description: it.text, pricePaise: toPaise(it.heading) }));
}
