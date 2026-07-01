import type { ReactNode } from "react";
import Link from "next/link";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-mesh-glow" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.6)_100%)]" />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-sm font-semibold tracking-tight text-slate-300"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-sky-400 text-xs font-bold text-slate-950">
            A
          </span>
          Atithira
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-white">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-slate-400">
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
      className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400/50 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/20 ${props.className ?? ""}`}
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
      className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
