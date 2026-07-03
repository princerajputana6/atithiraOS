import type { ReactNode } from "react";
import { Card } from "@/components/card";

export type TenantStatus = "trial" | "active" | "suspended" | "churned";

export const STATUS_STYLES: Record<TenantStatus, string> = {
  trial: "bg-sky-50 text-sky-700 ring-sky-100",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  suspended: "bg-amber-50 text-amber-700 ring-amber-100",
  churned: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const adminCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function adminRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value?: number | string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value ?? "—"}</p>
    </Card>
  );
}

export function AdminField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
    />
  );
}

export function AdminButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: TenantStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
