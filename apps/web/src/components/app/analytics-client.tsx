"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, CardBody, Table, Th, Td, EmptyState } from "@/components/ui";

interface ActivityTrendPoint {
  date: string;
  count: number;
}
interface ActionCount {
  action: string;
  count: number;
}
interface ActivitySummary {
  totalEvents: number;
  trend: ActivityTrendPoint[];
  topActions: ActionCount[];
}

export function AnalyticsClient() {
  const [summary, setSummary] = useState<ActivitySummary | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/v1/intelligence/analytics");
      if (res.ok) setSummary(await res.json());
    })();
  }, []);

  const maxCount = Math.max(1, ...(summary?.trend.map((p) => p.count) ?? [0]));

  return (
    <div>
      <PageHeader
        title="Intelligence"
        description="Platform activity trends, aggregated from every module's audit trail."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Events (30d)
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {summary?.totalEvents ?? "—"}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="mb-6">
        <CardBody>
          <p className="mb-4 text-sm font-semibold text-slate-900">
            Daily activity
          </p>
          {!summary || summary.trend.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Trends appear once your team starts using the platform."
            />
          ) : (
            <div className="flex h-32 items-end gap-1">
              {summary.trend.map((point) => (
                <div
                  key={point.date}
                  title={`${point.date}: ${point.count}`}
                  className="flex-1 rounded-t bg-brand-500/70"
                  style={{ height: `${(point.count / maxCount) * 100}%` }}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="mb-4 text-sm font-semibold text-slate-900">Top actions</p>
          {!summary || summary.topActions.length === 0 ? (
            <EmptyState title="No actions recorded yet" />
          ) : (
            <Table>
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <Th>Action</Th>
                  <Th>Count</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.topActions.map((a) => (
                  <tr key={a.action}>
                    <Td className="font-mono text-xs">{a.action}</Td>
                    <Td>{a.count}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
