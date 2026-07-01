"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import {
  AdminPageHeader,
  StatCard,
  adminCurrency,
  adminRelativeTime,
  type TenantStatus,
} from "@/components/admin/admin-ui";

interface Stats {
  tenants: number;
  activeTenants: number;
  tenantsByStatus: Record<TenantStatus, number>;
  newTenants7d: number;
  users: number;
  mrr: number;
  planDistribution: Record<string, number>;
}

interface ActivityEntry {
  id: string;
  tenantName: string;
  action: string;
  targetType: string;
  actorType: "user" | "system" | "platform_owner";
  actorEmail: string | null;
  createdAt: string;
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    void (async () => {
      const [statsRes, activityRes] = await Promise.all([
        fetch("/api/v1/admin/stats"),
        fetch("/api/v1/admin/activity"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (activityRes.ok) setActivity((await activityRes.json()).activity ?? []);
    })();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Platform Overview"
        description="Every tenant, organization, and owner on Atithira at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total tenants" value={stats?.tenants} />
        <StatCard label="Active / trial" value={stats?.activeTenants} />
        <StatCard label="Total users" value={stats?.users} />
        <StatCard label="MRR" value={stats ? adminCurrency.format(stats.mrr) : undefined} />
        <StatCard label="New tenants (7d)" value={stats?.newTenants7d} />
        <StatCard label="Trial" value={stats?.tenantsByStatus.trial} />
        <StatCard label="Suspended" value={stats?.tenantsByStatus.suspended} />
        <StatCard label="Churned" value={stats?.tenantsByStatus.churned} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Plan distribution
          </h2>
          {stats && Object.keys(stats.planDistribution).length > 0 ? (
            <div className="flex flex-col gap-3">
              {Object.entries(stats.planDistribution).map(([plan, count]) => {
                const pct = Math.round((count / Math.max(1, stats.tenants)) * 100);
                return (
                  <div key={plan}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize text-slate-200">{plan}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No subscriptions yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Recent platform activity
          </h2>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500">No activity recorded yet.</p>
          ) : (
            <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
              {activity.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <div className="text-slate-200">
                    <span className="font-medium text-white">
                      {entry.actorEmail ?? entry.actorType}
                    </span>{" "}
                    <span className="text-slate-400">{entry.action}</span>{" "}
                    <span className="text-slate-500">on {entry.targetType}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {entry.tenantName} · {adminRelativeTime(entry.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
