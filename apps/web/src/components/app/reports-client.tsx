"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, CardBody, Button, Table, Th, Td, EmptyState } from "@/components/ui";

interface ReportMeta {
  key: string;
  name: string;
  description: string;
}

export function ReportsClient() {
  const [reports, setReports] = useState<ReportMeta[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/v1/reports");
      if (res.ok) setReports((await res.json()).reports ?? []);
    })();
  }, []);

  async function runReport(key: string) {
    setSelected(key);
    const res = await fetch(`/api/v1/reports/${key}`);
    if (res.ok) setRows((await res.json()).rows ?? []);
  }

  const columns = rows[0] ? Object.keys(rows[0]) : [];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Parameterized reports across finance, people, and CRM — exportable as CSV."
      />

      {reports.length === 0 ? (
        <EmptyState title="No reports registered" />
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <Card key={r.key} className={selected === r.key ? "ring-2 ring-brand-500" : ""}>
              <CardBody>
                <p className="font-medium text-slate-900">{r.name}</p>
                <p className="mt-1 text-xs text-slate-500">{r.description}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" onClick={() => runReport(r.key)}>
                    Run
                  </Button>
                  <a
                    href={`/api/v1/reports/${r.key}?format=csv`}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Export CSV
                  </a>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <Card>
          <CardBody>
            {rows.length === 0 ? (
              <EmptyState title="No data for this report yet" />
            ) : (
              <Table>
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {columns.map((c) => (
                      <Th key={c}>{c}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {columns.map((c) => (
                        <Td key={c}>{String(row[c] ?? "")}</Td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
