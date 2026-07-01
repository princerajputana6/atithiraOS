"use client";

import { useEffect, useState } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Select,
  Badge,
  EmptyState,
} from "@/components/ui";

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  available: boolean;
}
interface TableRow {
  _id: string;
  label: string;
}
interface OrderLine {
  menuItemId: string;
  name: string;
  qty: number;
  price: number;
}
interface Order {
  _id: string;
  number: string;
  type: string;
  tableLabel?: string | null;
  items: OrderLine[];
  total: number;
  currency: string;
  status: "open" | "preparing" | "served" | "paid" | "cancelled";
}

const NEXT: Record<Order["status"], Order["status"] | null> = {
  open: "preparing",
  preparing: "served",
  served: "paid",
  paid: null,
  cancelled: null,
};
const TONE: Record<Order["status"], "blue" | "amber" | "green" | "gray" | "red"> = {
  open: "blue",
  preparing: "amber",
  served: "green",
  paid: "gray",
  cancelled: "red",
};

function money(a: number, c: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(a);
  } catch {
    return `${c} ${a}`;
  }
}

export function OrdersClient() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tableId, setTableId] = useState("");
  const [type, setType] = useState("dine_in");
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [m, t, o] = await Promise.all([
      fetch("/api/v1/restaurant/menu"),
      fetch("/api/v1/restaurant/tables"),
      fetch("/api/v1/restaurant/orders"),
    ]);
    if (m.ok) setMenu(((await m.json()).items ?? []).filter((x: MenuItem) => x.available));
    if (t.ok) setTables((await t.json()).tables ?? []);
    if (o.ok) setOrders((await o.json()).orders ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  const cartLines = menu
    .filter((m) => cart[m._id])
    .map((m) => ({ item: m, qty: cart[m._id] ?? 0 }));
  const cartTotal = cartLines.reduce((s, l) => s + l.item.price * l.qty, 0);

  function addToCart(id: string, delta: number) {
    setCart((c) => {
      const qty = Math.max(0, (c[id] ?? 0) + delta);
      const next = { ...c, [id]: qty };
      if (qty === 0) delete next[id];
      return next;
    });
  }

  async function placeOrder() {
    setError(null);
    if (cartLines.length === 0) {
      setError("Add at least one item.");
      return;
    }
    setBuilding(true);
    const res = await fetch("/api/v1/restaurant/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type,
        tableId: type === "dine_in" ? tableId || undefined : undefined,
        items: cartLines.map((l) => ({ menuItemId: l.item._id, qty: l.qty })),
      }),
    });
    setBuilding(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    setCart({});
    setTableId("");
    await load();
  }

  async function advance(o: Order) {
    const next = NEXT[o.status];
    if (!next) return;
    await fetch(`/api/v1/restaurant/orders/${o._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader title="Orders" description="Take dine-in / takeaway orders and move them to paid." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order builder */}
        <Card className="lg:col-span-1">
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">New order</h2>
            <div className="mb-3 flex gap-2">
              <Select value={type} onChange={(e) => setType(e.target.value)} className="flex-1">
                <option value="dine_in">Dine-in</option>
                <option value="takeaway">Takeaway</option>
              </Select>
              {type === "dine_in" && (
                <Select value={tableId} onChange={(e) => setTableId(e.target.value)} className="flex-1">
                  <option value="">No table</option>
                  {tables.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              )}
            </div>

            {menu.length === 0 ? (
              <p className="text-sm text-slate-500">
                Add available dishes in the Menu first.
              </p>
            ) : (
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {menu.map((m) => (
                  <div key={m._id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50">
                    <div className="text-sm">
                      <span className="text-slate-800">{m.name}</span>
                      <span className="ml-2 text-xs text-slate-400">₹{m.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => addToCart(m._id, -1)} className="h-6 w-6 rounded bg-slate-100 text-slate-600">
                        −
                      </button>
                      <span className="w-5 text-center text-sm">{cart[m._id] ?? 0}</span>
                      <button onClick={() => addToCart(m._id, 1)} className="h-6 w-6 rounded bg-brand-100 text-brand-700">
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">Subtotal (+5% GST at checkout)</span>
                <span className="font-medium text-slate-900">{money(cartTotal, "INR")}</span>
              </div>
              <Button onClick={placeOrder} loading={building} className="w-full">
                Place order
              </Button>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </CardBody>
        </Card>

        {/* Live orders */}
        <div className="lg:col-span-2">
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Build an order on the left to get started." />
          ) : (
            <div className="flex flex-col gap-3">
              {orders
                .slice()
                .reverse()
                .map((o) => (
                  <Card key={o._id}>
                    <CardBody className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{o.number}</span>
                          <Badge tone={TONE[o.status]}>{o.status}</Badge>
                          <span className="text-xs text-slate-400">
                            {o.type === "takeaway" ? "Takeaway" : o.tableLabel ? `Table ${o.tableLabel}` : "Dine-in"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">{money(o.total, o.currency)}</div>
                        {NEXT[o.status] && (
                          <button onClick={() => advance(o)} className="mt-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                            {o.status === "served" ? "Take payment →" : `Mark ${NEXT[o.status]} →`}
                          </button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
