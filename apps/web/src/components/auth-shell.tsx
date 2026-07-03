import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogoBadge } from "@/components/brand-logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-blue-50 px-4 py-12 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-mesh-glow" />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center"
          aria-label="Atithira home"
        >
          <BrandLogoBadge priority />
        </Link>

        <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-900/10">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-slate-600">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}

export function AuthInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${props.className ?? ""}`}
    />
  );
}

export function AuthButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
