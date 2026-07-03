"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/card";
import { AdminPageHeader } from "@/components/admin/admin-ui";

interface EffectiveModule {
  key: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  effectiveDefault: boolean;
}

export function SettingsClient() {
  const [modules, setModules] = useState<EffectiveModule[] | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/admin/module-defaults");
    if (res.ok) setModules((await res.json()).modules ?? []);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(mod: EffectiveModule) {
    setSavingKey(mod.key);
    const next = !mod.effectiveDefault;
    setModules((mods) =>
      mods
        ? mods.map((m) => (m.key === mod.key ? { ...m, effectiveDefault: next } : m))
        : mods,
    );
    const res = await fetch("/api/v1/admin/module-defaults", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ moduleKey: mod.key, enabled: next }),
    });
    setSavingKey(null);
    if (!res.ok) {
      setModules((mods) =>
        mods
          ? mods.map((m) => (m.key === mod.key ? { ...m, effectiveDefault: mod.effectiveDefault } : m))
          : mods,
      );
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Platform Settings"
        description="Choose which modules new tenants are provisioned with by default. Existing tenants are unaffected — grant or revoke those from Tenants → a specific tenant."
      />

      <Card className="p-0">
        <div className="border-b border-blue-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-950">Module catalog</h2>
          <p className="mt-1 text-xs text-slate-500">
            Toggling a module here changes the default-on set for tenants created from now on.
          </p>
        </div>
        {!modules ? (
          <p className="px-6 py-8 text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="divide-y divide-blue-100">
            {modules.map((mod) => (
              <button
                key={mod.key}
                onClick={() => toggle(mod)}
                disabled={savingKey === mod.key}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-blue-50 disabled:opacity-60"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-950">{mod.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-600">{mod.description}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {mod.effectiveDefault !== mod.defaultEnabled && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-100">
                      overridden
                    </span>
                  )}
                  <span
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                      mod.effectiveDefault ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        mod.effectiveDefault ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
