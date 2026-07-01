"use client";

import { useState, type FormEvent } from "react";
import type { SiteBlockItem } from "@atithira/types";
import { payWithRazorpay } from "@/components/website/razorpay";

interface Service {
  name: string;
  price?: string;
  duration?: string;
}

export function PublicBooking({
  slug,
  businessName,
  services,
}: {
  slug: string;
  businessName: string;
  services: Service[];
}) {
  const [service, setService] = useState(services[0]?.name ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      const res = await fetch(`/api/public/website/${slug}/bookings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ service, date, time, customerName: name, customerPhone: phone, customerEmail: email, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");

      if (data.payment) {
        const handshake = await payWithRazorpay({
          intent: data.payment,
          businessName,
          description: `Booking — ${service}`,
          prefill: { name, email, contact: phone },
        });
        if (!handshake) {
          setError("Payment was not completed. Your slot is held as pending.");
          setState("error");
          return;
        }
        const verify = await fetch(`/api/public/website/${slug}/payments/verify`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind: "booking", ...handshake }),
        });
        if (!verify.ok) throw new Error("Payment could not be verified");
      }
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm text-emerald-800">
        Your booking is confirmed — we&apos;ll see you soon! A confirmation will follow on your phone.
      </div>
    );
  }

  const selected = services.find((s) => s.name === service);

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3">
      <label className="flex flex-col gap-1 text-left text-sm">
        <span className="font-medium text-slate-700">Service</span>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        >
          {services.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
              {s.price ? ` — ${s.price}` : ""}
            </option>
          ))}
        </select>
      </label>
      {selected?.duration && <p className="-mt-1 text-left text-xs text-slate-500">{selected.duration}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
        <Field label="Time"><input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
      </div>
      <Field label="Your name"><input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone"><input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
        <Field label="Email (optional)"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
      </div>
      <Field label="Notes (optional)"><input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-1 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {state === "sending"
          ? "Please wait…"
          : selected?.price
            ? `Book & pay ${selected.price}`
            : "Book now"}
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

/** Maps a booking block's items to the Service shape the form needs. */
export function servicesFromItems(items: SiteBlockItem[] | undefined): Service[] {
  return (items ?? [])
    .filter((it) => it.title)
    .map((it) => ({ name: it.title!, price: it.heading, duration: it.text }));
}
