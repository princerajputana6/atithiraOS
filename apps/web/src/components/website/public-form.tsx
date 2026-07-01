"use client";

import { useState, type FormEvent } from "react";
import type { SiteForm } from "@atithira/types";

export function PublicForm({ slug, form }: { slug: string; form: SiteForm }) {
  const [data, setData] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const res = await fetch(`/api/public/website/${slug}/forms/${form._id}/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (res.ok) {
      setState("done");
      setData({});
    } else {
      setError((await res.json().catch(() => ({}))).error ?? "Submission failed");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
        Thanks — we&apos;ve received your details and will be in touch.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3">
      {form.fields.map((f) => (
        <label key={f.key} className="flex flex-col gap-1 text-left">
          <span className="text-sm font-medium text-slate-700">
            {f.label}
            {f.required && <span className="text-red-500"> *</span>}
          </span>
          {f.type === "textarea" ? (
            <textarea
              required={f.required}
              value={data[f.key] ?? ""}
              onChange={(e) => setData((d) => ({ ...d, [f.key]: e.target.value }))}
              className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          ) : (
            <input
              type={f.type === "phone" ? "tel" : f.type}
              required={f.required}
              value={data[f.key] ?? ""}
              onChange={(e) => setData((d) => ({ ...d, [f.key]: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          )}
        </label>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : form.submitText}
      </button>
    </form>
  );
}
