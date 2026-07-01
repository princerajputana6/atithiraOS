import { registerReport } from "@atithira/core-reporting";
import { listEmployees } from "./services";
import { listPayslips } from "./payroll-service";

registerReport({
  key: "headcount",
  name: "Headcount by Department",
  description: "Active employee count grouped by department.",
  run: async () => {
    const employees = await listEmployees();
    const byDept = new Map<string, number>();
    for (const emp of employees) {
      if (emp.status !== "active") continue;
      const dept = emp.department ?? "Unassigned";
      byDept.set(dept, (byDept.get(dept) ?? 0) + 1);
    }
    return [...byDept.entries()].map(([department, count]) => ({
      department,
      count,
    }));
  },
});

registerReport({
  key: "payroll-summary",
  name: "Payroll Summary",
  description: "Every payslip generated, with gross/deductions/net pay.",
  run: async () => {
    const payslips = await listPayslips();
    return payslips.map((p) => ({
      employeeId: p.employeeId,
      period: `${p.periodMonth}/${p.periodYear}`,
      gross: p.gross,
      totalDeductions: p.totalDeductions,
      netPay: p.netPay,
      status: p.status,
    }));
  },
});
