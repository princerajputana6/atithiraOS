"use client";

import { useEffect, useRef, useState } from "react";

interface SearchResult {
  type: string;
  id: string;
  label: string;
}

const TYPE_LABEL: Record<string, string> = {
  lead: "Lead",
  contact: "Contact",
  invoice: "Invoice",
  product: "Product",
  employee: "Employee",
  task: "Task",
};

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      void (async () => {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResults((await res.json()).results ?? []);
          setOpen(true);
        }
      })();
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <input
        type="search"
        placeholder="Search leads, invoices, tasks…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
      />
      {open && results.length > 0 && (
        <ul className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {results.slice(0, 8).map((r) => (
            <li
              key={`${r.type}-${r.id}`}
              className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <span className="truncate">{r.label}</span>
              <span className="ml-2 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {TYPE_LABEL[r.type] ?? r.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
