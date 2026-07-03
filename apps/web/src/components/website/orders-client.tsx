"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Badge, Select } from "@/components/ui";
import type { WebsiteOrder, FulfilmentStatus, PaymentState } from "@atithira/types";

const STATUSES: FulfilmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];

const statusTone: Record<FulfilmentStatus, "gray" | "green" | "amber" | "red"> = {
  pending: "amber",
  confirmed: "green",
  completed: "green",
  cancelled: "red",
};
const paymentTone: Record<PaymentState, "gray" | "green" | "amber" | "red"> = {
  none: "gray",
  pending: "amber",
  paid: "green",
  failed: "red",
};

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export function OrdersClient() {
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/website/orders");
    if (res.ok) setOrders((await res.json()).orders ?? []);
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, status: FulfilmentStatus) {
    setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
    await fetch("/api/v1/website/orders", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Online orders placed from your website's menu / order blocks."
      />
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Add a Menu / Order block to a published page and your orders will appear here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Card key={o._id}>
              <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{o.customerName}</span>
                    <span className="text-xs text-slate-500">{o.customerPhone}</span>
                    <Badge tone="blue">{o.fulfilment}</Badge>
                  </div>
                  <ul className="mt-2 text-sm text-slate-600">
                    {o.lines.map((l, i) => (
                      <li key={i}>
                        {l.qty} × {l.title}{" "}
                        <span className="text-slate-400">({rupees(l.unitPaise * l.qty)})</span>
                      </li>
                    ))}
                  </ul>
                  {o.address && <p className="mt-1 text-xs text-slate-500">Deliver to: {o.address}</p>}
                  {o.notes && <p className="mt-1 text-xs text-slate-500">Notes: {o.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-semibold text-slate-900">{rupees(o.amountPaise)}</span>
                  <Badge tone={paymentTone[o.payment]}>{o.payment}</Badge>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                    <Select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value as FulfilmentStatus)}
                      className="!w-auto py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
