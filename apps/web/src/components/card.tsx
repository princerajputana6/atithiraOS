import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-blue-100 bg-white p-6 text-slate-900 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
