"use client";

import { useEffect, useState } from "react";
import { PageHeader, Table, Th, Td, EmptyState } from "@/components/ui";

interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  type: string;
  debit: number;
  credit: number;
}

export function GLClient() {
  const [rows, setRows] = useState<TrialBalanceRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/v1/finance/gl");
      if (res.ok) setRows((await res.json()).trialBalance ?? []);
      setLoaded(true);
    })();
  }, []);

  const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0);

  return (
    <div>
      <PageHeader
        title="General Ledger"
        description="Trial balance across every account, posted automatically from invoices, payments, and expenses."
      />
      {!loaded ? null : rows.every((r) => r.debit === 0 && r.credit === 0) ? (
        <EmptyState
          title="No postings yet"
          description="Issue an invoice, record a payment, or approve an expense to see entries here."
        />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Code</Th>
              <Th>Account</Th>
              <Th>Type</Th>
              <Th>Debit</Th>
              <Th>Credit</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.accountCode}>
                <Td className="font-mono text-xs">{r.accountCode}</Td>
                <Td className="font-medium text-slate-900">{r.accountName}</Td>
                <Td className="capitalize">{r.type}</Td>
                <Td>{r.debit ? `₹${r.debit.toLocaleString("en-IN")}` : "—"}</Td>
                <Td>{r.credit ? `₹${r.credit.toLocaleString("en-IN")}` : "—"}</Td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-semibold">
              <Td>—</Td>
              <Td>Total</Td>
              <Td>—</Td>
              <Td>₹{totalDebit.toLocaleString("en-IN")}</Td>
              <Td>₹{totalCredit.toLocaleString("en-IN")}</Td>
            </tr>
          </tbody>
        </Table>
      )}
    </div>
  );
}
