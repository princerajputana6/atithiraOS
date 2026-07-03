"use client";

import { useState } from "react";

const VARIANT_STYLES = {
  app: "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
  auth: "w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
  admin: "w-full rounded-xl border border-blue-100 bg-white px-3 py-2 pr-11 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
} as const;

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      {visible ? (
        <>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6A3 3 0 0013.4 13.4" />
          <path d="M7.1 7.6C4.2 9.3 2.5 12 2.5 12s3.5 6 9.5 6c1.8 0 3.4-.5 4.7-1.2" />
          <path d="M14.1 6.3C18.8 7.3 21.5 12 21.5 12a15.4 15.4 0 01-2.2 2.8" />
        </>
      )}
    </svg>
  );
}

export function PasswordInput({
  variant = "app",
  className = "",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  variant?: keyof typeof VARIANT_STYLES;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${VARIANT_STYLES[variant]} ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <EyeIcon visible={visible} />
      </button>
    </div>
  );
}
