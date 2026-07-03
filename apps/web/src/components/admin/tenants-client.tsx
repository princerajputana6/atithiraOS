"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { SOLUTION_PACKS, MODULE_CATALOG, type SolutionPack } from "@atithira/types";
import { Card } from "@/components/card";
import {
  AdminPageHeader,
  AdminButton,
  AdminField,
  AdminInput,
  StatusPill,
  type TenantStatus,
} from "@/components/admin/admin-ui";
import { PasswordInput } from "@/components/password-input";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
  ownerEmail: string | null;
  memberCount: number;
  planKey: string | null;
  industry: string | null;
}

const MODULE_LABEL = new Map(MODULE_CATALOG.map((m) => [m.key, m.label]));

const EMPTY_ORG = {
  organizationName: "",
  slug: "",
  ownerName: "",
  ownerEmail: "",
  ownerPassword: "",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function TenantsClient() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0 industry, 1 requirements, 2 org+owner
  const [packKey, setPackKey] = useState<string | null>(null);
  const [modules, setModules] = useState<string[]>([]); // manual override, seeded from pack
  const [org, setOrg] = useState(EMPTY_ORG);
  const [intake, setIntake] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const pack: SolutionPack | undefined = useMemo(
    () => SOLUTION_PACKS.find((p) => p.key === packKey),
    [packKey],
  );

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/admin/tenants");
    if (res.ok) setTenants((await res.json()).tenants ?? []);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setStep(0);
    setPackKey(null);
    setModules([]);
    setOrg(EMPTY_ORG);
    setIntake({});
    setError(null);
  }

  function choosePack(p: SolutionPack) {
    setPackKey(p.key);
    setModules(p.modules); // seed the manual picker from the pack
    setStep(1);
  }

  function toggleModule(key: string) {
    setModules((m) => (m.includes(key) ? m.filter((k) => k !== key) : [...m, key]));
  }

  function requiredIntakeMissing(): string | null {
    if (!pack) return null;
    for (const f of pack.intake) {
      if (f.required && !intake[f.key]?.toString().trim()) {
        return `“${f.label}” is required.`;
      }
    }
    return null;
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setCreating(true);
    const res = await fetch("/api/v1/admin/tenants", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...org, industryPackKey: packKey, intake, modules }),
    });
    setCreating(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not create tenant");
      return;
    }
    setMessage(
      `Tenant “${org.organizationName}” created as ${pack?.label ?? "General"} — ${modules.length} modules enabled.`,
    );
    resetForm();
    setShowForm(false);
    await load();
  }

  function updateOrg(key: keyof typeof EMPTY_ORG) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setOrg((f) => {
        const next = { ...f, [key]: e.target.value };
        // Auto-suggest a slug from the org name until the user edits it.
        if (
          key === "organizationName" &&
          (!f.slug || f.slug === slugify(f.organizationName))
        ) {
          next.slug = slugify(e.target.value);
        }
        return next;
      });
  }

  return (
    <div>
      <AdminPageHeader
        title="Tenants"
        description="Create a reviewed workspace from an industry profile, selected services, and owner details."
        action={
          <AdminButton
            onClick={() => {
              setShowForm((s) => !s);
              if (showForm) resetForm();
            }}
          >
            {showForm ? "Close setup" : "+ New workspace"}
          </AdminButton>
        }
      />

      {showForm && (
        <Card className="mb-6 overflow-hidden p-0">
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr]">
            <aside className="bg-sidebar-gradient p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100/70">
                Workspace setup
              </p>
              <h2 className="mt-2 text-xl font-semibold">Configure before launch</h2>
              <p className="mt-2 text-sm leading-relaxed text-blue-50/75">
                Pick the business type, capture operating context, then assign the modules and owner.
              </p>
              <div className="mt-6 space-y-3">
                {["Industry profile", "Business requirements", "Modules & owner"].map((label, i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                      i === step ? "bg-white/20 text-white" : i < step ? "text-blue-50" : "text-blue-100/60"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        i <= step ? "bg-white text-brand-700" : "bg-white/10 text-blue-100"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </aside>

            <div className="p-6">
          {/* Step indicator */}
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
            {["Industry", "Requirements", "Owner & workspace"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                    i <= step ? "bg-brand-600 text-white" : "bg-blue-50 text-slate-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={i <= step ? "text-slate-950" : "text-slate-500"}>{label}</span>
                {i < 2 && <span className="mx-1 text-slate-400">›</span>}
              </div>
            ))}
          </div>

          {/* Step 0 — industry */}
          {step === 0 && (
            <div>
              <h2 className="mb-1 text-lg font-semibold text-slate-950">
                What kind of business is this?
              </h2>
              <p className="mb-4 text-sm text-slate-600">
                We&apos;ll pre-configure the right modules and terminology for the vertical.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SOLUTION_PACKS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => choosePack(p)}
                    className={`rounded-xl border p-4 text-left transition ${
                      packKey === p.key
                        ? "border-brand-300 bg-blue-50"
                        : "border-blue-100 bg-white hover:border-brand-200 hover:bg-blue-50"
                    }`}
                  >
                    <div className="text-2xl">{p.emoji}</div>
                    <div className="mt-2 font-medium text-slate-950">{p.label}</div>
                    <div className="mt-1 text-xs text-slate-600">{p.tagline}</div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.modules.map((m) => (
                        <span
                          key={m}
                          className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-slate-600"
                        >
                          {MODULE_LABEL.get(m) ?? m}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — dynamic requirements */}
          {step === 1 && pack && (
            <div>
              <h2 className="mb-1 text-lg font-semibold text-slate-950">
                {pack.emoji} {pack.label} — tell us about the business
              </h2>
              <p className="mb-4 text-sm text-slate-600">
                These answers are saved to the workspace so the team starts with real context.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {pack.intake.map((f) => (
                  <AdminField key={f.key} label={f.label + (f.required ? " *" : "")}>
                    {f.type === "select" ? (
                      <select
                        value={intake[f.key] ?? ""}
                        onChange={(e) => setIntake((s) => ({ ...s, [f.key]: e.target.value }))}
                        className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      >
                        <option value="">Select…</option>
                        {f.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "boolean" ? (
                      <label className="flex items-center gap-2 py-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={intake[f.key] === "yes"}
                          onChange={(e) =>
                            setIntake((s) => ({ ...s, [f.key]: e.target.checked ? "yes" : "no" }))
                          }
                          className="h-4 w-4 rounded border-blue-200 text-brand-600"
                        />
                        Yes
                      </label>
                    ) : (
                      <AdminInput
                        type={f.type === "number" ? "number" : "text"}
                        placeholder={f.placeholder}
                        value={intake[f.key] ?? ""}
                        onChange={(e) => setIntake((s) => ({ ...s, [f.key]: e.target.value }))}
                      />
                    )}
                  </AdminField>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <AdminButton onClick={() => setStep(0)}>← Back</AdminButton>
                <AdminButton
                  onClick={() => {
                    const miss = requiredIntakeMissing();
                    if (miss) {
                      setError(miss);
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                >
                  Continue →
                </AdminButton>
              </div>
            </div>
          )}

          {/* Step 2 — org + owner */}
          {step === 2 && pack && (
            <form onSubmit={handleCreate}>
              <h2 className="mb-1 text-lg font-semibold text-slate-950">Workspace &amp; owner</h2>
              <p className="mb-4 text-sm text-slate-600">
                {pack.label} workspace · {pack.defaults.currency} · {modules.length} modules enabled.
              </p>

              {/* Manual module picker — seeded from the pack, fully editable */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Modules for this tenant
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MODULE_CATALOG.map((m) => {
                    const on = modules.includes(m.key);
                    return (
                      <button
                        type="button"
                        key={m.key}
                        onClick={() => toggleModule(m.key)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                          on
                            ? "border-brand-300 bg-blue-50 text-brand-700"
                            : "border-blue-100 bg-white text-slate-600 hover:border-brand-200 hover:bg-blue-50"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                            on ? "bg-brand-600 text-white" : "bg-blue-50"
                          }`}
                        >
                          {on ? "✓" : ""}
                        </span>
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AdminField label="Organization name">
                  <AdminInput required value={org.organizationName} onChange={updateOrg("organizationName")} />
                </AdminField>
                <AdminField label="Workspace slug">
                  <AdminInput required value={org.slug} onChange={updateOrg("slug")} />
                </AdminField>
                <AdminField label="Owner name">
                  <AdminInput value={org.ownerName} onChange={updateOrg("ownerName")} />
                </AdminField>
                <AdminField label="Owner email">
                  <AdminInput required type="email" value={org.ownerEmail} onChange={updateOrg("ownerEmail")} />
                </AdminField>
                <AdminField label="Owner password">
                  <PasswordInput
                    variant="admin"
                    required
                    value={org.ownerPassword}
                    onChange={updateOrg("ownerPassword")}
                  />
                </AdminField>
              </div>
              <div className="mt-5 flex gap-2">
                <AdminButton onClick={() => setStep(1)}>← Back</AdminButton>
                <AdminButton type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create tenant"}
                </AdminButton>
              </div>
            </form>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </Card>
      )}

      {message && <p className="mb-4 text-sm text-emerald-700">{message}</p>}

      <Card className="p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-blue-100 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3 font-medium">Organization</th>
              <th className="px-6 py-3 font-medium">Industry</th>
              <th className="px-6 py-3 font-medium">Owner</th>
              <th className="px-6 py-3 font-medium">Members</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No tenants yet. Create your first one above.
                </td>
              </tr>
            )}
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-b border-blue-50 text-slate-700 last:border-0 hover:bg-blue-50/50">
                <td className="px-6 py-3">
                  <Link href={`/admin/tenants/${tenant.id}`} className="group">
                    <div className="font-medium text-slate-950 group-hover:text-brand-700">
                      {tenant.name}
                    </div>
                    <div className="text-xs text-slate-500">/{tenant.slug}</div>
                  </Link>
                </td>
                <td className="px-6 py-3">{tenant.industry ?? "—"}</td>
                <td className="px-6 py-3">{tenant.ownerEmail ?? "—"}</td>
                <td className="px-6 py-3">{tenant.memberCount}</td>
                <td className="px-6 py-3">
                  <StatusPill status={tenant.status} />
                </td>
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/tenants/${tenant.id}`}
                    className="text-xs font-medium text-brand-700 hover:text-brand-800"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
