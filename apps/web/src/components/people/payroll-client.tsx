"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Select,
  Field,
  Table,
  Th,
  Td,
  Badge,
  EmptyState,
} from "@/components/ui";

interface Employee {
  _id: string;
  name: string;
  status: "active" | "terminated";
}

interface Payslip {
  _id: string;
  employeeId: string;
  periodMonth: number;
  periodYear: number;
  gross: number;
  pf: number;
  esi: number;
  tds: number;
  totalDeductions: number;
  netPay: number;
  status: "generated" | "paid";
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function currentPeriod() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function PayrollClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const { month, year } = currentPeriod();
  const [periodMonth, setPeriodMonth] = useState(month);
  const [periodYear, setPeriodYear] = useState(year);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [empRes, slipRes] = await Promise.all([
      fetch("/api/v1/people/employees"),
      fetch("/api/v1/people/payroll/payslips"),
    ]);
    if (empRes.ok) {
      const emps = ((await empRes.json()).employees ?? []) as Employee[];
      setEmployees(emps);
      if (!employeeId && emps[0]) setEmployeeId(emps[0]._id);
    }
    if (slipRes.ok) setPayslips((await slipRes.json()).payslips ?? []);
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const employeeName = (id: string) =>
    employees.find((e) => e._id === id)?.name ?? id;

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/people/payroll/payslips", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ employeeId, periodMonth, periodYear }),
    });
    setLoading(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    await load();
  }

  async function markPaid(payslip: Payslip) {
    await fetch(`/api/v1/people/payroll/payslips/${payslip._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "mark_paid" }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Generate payslips with statutory PF/ESI deductions."
      />

      <Card className="mb-6">
        <CardBody>
          <form
            onSubmit={handleGenerate}
            className="grid grid-cols-1 gap-3 sm:grid-cols-4"
          >
            <Field label="Employee">
              <Select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Month">
              <Select
                value={periodMonth}
                onChange={(e) => setPeriodMonth(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Year">
              <Select
                value={periodYear}
                onChange={(e) => setPeriodYear(Number(e.target.value))}
              >
                {[year - 1, year, year + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" loading={loading} className="w-full">
                Generate payslip
              </Button>
            </div>
            {error && <span className="sm:col-span-4 text-sm text-red-600">{error}</span>}
          </form>
        </CardBody>
      </Card>

      {payslips.length === 0 ? (
        <EmptyState
          title="No payslips yet"
          description="Generate the first payslip above."
        />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Employee</Th>
              <Th>Period</Th>
              <Th>Gross</Th>
              <Th>PF</Th>
              <Th>ESI</Th>
              <Th>Net pay</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payslips.map((p) => (
              <tr key={p._id}>
                <Td className="font-medium text-slate-900">
                  {employeeName(p.employeeId)}
                </Td>
                <Td>
                  {MONTHS[p.periodMonth - 1]} {p.periodYear}
                </Td>
                <Td>₹{p.gross.toLocaleString("en-IN")}</Td>
                <Td>₹{p.pf.toLocaleString("en-IN")}</Td>
                <Td>₹{p.esi.toLocaleString("en-IN")}</Td>
                <Td className="font-medium">₹{p.netPay.toLocaleString("en-IN")}</Td>
                <Td>
                  <Badge tone={p.status === "paid" ? "green" : "amber"}>
                    {p.status}
                  </Badge>
                </Td>
                <Td>
                  {p.status === "generated" ? (
                    <button
                      onClick={() => markPaid(p)}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Mark paid
                    </button>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
