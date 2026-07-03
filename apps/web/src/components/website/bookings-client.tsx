"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader, Card, CardBody, Badge, EmptyState, Select } from "@/components/ui";
import type { WebsiteBooking, FulfilmentStatus, PaymentState } from "@atithira/types";

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

export function BookingsClient() {
  const [bookings, setBookings] = useState<WebsiteBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/website/bookings");
    if (res.ok) setBookings((await res.json()).bookings ?? []);
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, status: FulfilmentStatus) {
    setBookings((bs) => bs.map((b) => (b._id === id ? { ...b, status } : b)));
    await fetch("/api/v1/website/bookings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Appointments and reservations placed from your website's booking blocks."
      />
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Add a Booking block to a published page and your appointments will appear here."
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">{b.customerName}</div>
                      <div className="text-xs text-slate-500">{b.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{b.service}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {b.date} <span className="text-slate-400">·</span> {b.time}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{b.amountPaise > 0 ? rupees(b.amountPaise) : "Free"}</td>
                    <td className="px-5 py-3">
                      <Badge tone={paymentTone[b.payment]}>{b.payment}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Badge tone={statusTone[b.status]}>{b.status}</Badge>
                        <Select
                          value={b.status}
                          onChange={(e) => updateStatus(b._id, e.target.value as FulfilmentStatus)}
                          className="!w-auto py-1 text-xs"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
