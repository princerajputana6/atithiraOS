"use client";

import { useState } from "react";

const SERVICES = [
  "CRM",
  "Finance",
  "People & Payroll",
  "Inventory",
  "Procurement",
  "Projects",
  "Restaurant",
  "Hotel",
  "Clinic",
  "Retail POS",
  "Website Builder",
  "Automation",
  "AI Copilot",
  "Marketplace",
  "Developer API",
];

export function ServiceRequestForm() {
  const [selected, setSelected] = useState<string[]>([
    "CRM",
    "Finance",
    "Website Builder",
  ]);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  function toggle(service: string) {
    setSelected((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/public/service-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        company: form.get("company"),
        message: form.get("message"),
        services: selected,
      }),
    });

    if (res.ok) {
      setStatus("sent");
      event.currentTarget.reset();
      return;
    }

    const body = await res.json().catch(() => null);
    setError(body?.error ?? "Could not send the request. Please try again.");
    setStatus("error");
  }

  return (
    <form
      id="request"
      onSubmit={submit}
      className="rounded-2xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-900/10 sm:p-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-slate-950">
          Request services
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Tell us what you want to run on Atithira. We will review it and get
          back to you.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Your name"
          className="rounded-xl border border-blue-100 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Work email"
          className="rounded-xl border border-blue-100 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <input
          name="phone"
          placeholder="Phone"
          className="rounded-xl border border-blue-100 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <input
          name="company"
          placeholder="Company"
          className="rounded-xl border border-blue-100 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="mt-5">
        <div className="text-sm font-medium text-slate-800">
          Services you want
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SERVICES.map((service) => {
            const active = selected.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => toggle(service)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                    : "border-blue-100 bg-blue-50 text-slate-600 hover:border-brand-200 hover:bg-blue-100"
                }`}
              >
                {service}
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        name="message"
        rows={4}
        placeholder="Anything specific you want us to know?"
        className="mt-5 w-full rounded-xl border border-blue-100 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />

      {status === "sent" && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Request sent. We will contact you before creating any workspace.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Sending request..." : "Submit service request"}
      </button>
    </form>
  );
}
