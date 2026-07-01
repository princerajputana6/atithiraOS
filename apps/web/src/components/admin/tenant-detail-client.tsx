"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { AdminPageHeader, StatusPill, type TenantStatus } from "@/components/admin/admin-ui";

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
  trialEndsAt: string | null;
  ownerEmail: string | null;
  memberCount: number;
  planKey: string | null;
}

interface ModuleEntitlement {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function TenantDetailClient({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [modules, setModules] = useState<ModuleEntitlement[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const load = useCallback(async () => {
    const [detailRes, featuresRes] = await Promise.all([
      fetch(`/api/v1/admin/tenants/${tenantId}`),
      fetch(`/api/v1/admin/tenants/${tenantId}/features`),
    ]);
    if (detailRes.ok) setTenant((await detailRes.json()).tenant);
    if (featuresRes.ok) setModules((await featuresRes.json()).modules ?? []);
  }, [tenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(status: TenantStatus) {
    const res = await fetch(`/api/v1/admin/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await load();
  }

  async function toggleModule(mod: ModuleEntitlement) {
    setSavingKey(mod.key);
    const next = !mod.enabled;
    // Optimistic — reflect immediately, revert on failure.
    setModules((mods) =>
      mods.map((m) => (m.key === mod.key ? { ...m, enabled: next } : m)),
    );
    const res = await fetch(`/api/v1/admin/tenants/${tenantId}/features`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ moduleKey: mod.key, enabled: next }),
    });
    setSavingKey(null);
    if (!res.ok) {
      setModules((mods) =>
        mods.map((m) => (m.key === mod.key ? { ...m, enabled: mod.enabled } : m)),
      );
    }
  }

  async function deleteTenant() {
    if (!tenant) return;
    setDeleting(true);
    const res = await fetch(`/api/v1/admin/tenants/${tenantId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/tenants");
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  if (!tenant) {
    return (
      <div className="text-sm text-slate-400">
        <Link href="/admin/tenants" className="text-indigo-400 hover:text-indigo-300">
          ← Tenants
        </Link>
        <p className="mt-4">Loading…</p>
      </div>
    );
  }

  const canDelete = confirmText.trim() === tenant.slug;

  return (
    <div>
      <Link
        href="/admin/tenants"
        className="mb-4 inline-block text-sm text-indigo-400 hover:text-indigo-300"
      >
        ← Tenants
      </Link>

      <AdminPageHeader
        title={tenant.name}
        description={`/${tenant.slug}`}
        action={<StatusPill status={tenant.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Owner</p>
          <p className="mt-2 text-sm text-white">{tenant.ownerEmail ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Plan</p>
          <p className="mt-2 text-sm capitalize text-white">{tenant.planKey ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Members</p>
          <p className="mt-2 text-sm text-white">{tenant.memberCount}</p>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-white">Lifecycle</h2>
        <div className="flex flex-wrap gap-2">
          {(["trial", "active", "suspended", "churned"] as TenantStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              disabled={tenant.status === s}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ring-1 transition disabled:opacity-40 ${
                tenant.status === s
                  ? "bg-white/10 text-white ring-white/20"
                  : "text-slate-300 ring-white/10 hover:bg-white/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-white">Features</h2>
        <p className="mt-1 text-xs text-slate-500">
          Grant or revoke modules for this tenant. Changes take effect on their next page load.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {modules.map((mod) => (
            <button
              key={mod.key}
              onClick={() => toggleModule(mod)}
              disabled={savingKey === mod.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/[0.07] disabled:opacity-60"
            >
              <span>
                <span className="block text-sm font-medium text-white">{mod.label}</span>
                <span className="block text-xs text-slate-500">{mod.description}</span>
              </span>
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
                  mod.enabled ? "bg-emerald-500" : "bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    mod.enabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-6 border-red-500/30 bg-red-500/[0.04]">
        <h2 className="text-sm font-semibold text-red-300">Danger zone</h2>
        <p className="mt-1 text-xs text-slate-400">
          Permanently delete this tenant and <span className="text-slate-300">all</span> of its
          data — members, roles, and every module record. This cannot be undone. Type the
          workspace slug <span className="font-mono text-slate-300">{tenant.slug}</span> to confirm.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={tenant.slug}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-red-400/50 focus:ring-2 focus:ring-red-400/20"
          />
          <button
            onClick={deleteTenant}
            disabled={!canDelete || deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete tenant"}
          </button>
        </div>
      </Card>
    </div>
  );
}
