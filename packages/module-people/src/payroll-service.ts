import { publishEvent } from "@atithira/core-events";
import { getTenantContext } from "@atithira/db";
import type { Payslip, SalaryStructure } from "@atithira/types";
import {
  getEmployeeRepository,
  getSalaryStructureRepository,
  getPayslipRepository,
} from "./repositories";

// EPFO's simplified rule: 12% of basic, capped at a ₹15,000 basic (i.e. the
// employee PF contribution never exceeds ₹1,800/month regardless of actual basic).
const PF_RATE = 0.12;
const PF_WAGE_CEILING = 15_000;
// ESI applies only below the ESI wage ceiling; above it, employees exit the
// scheme entirely (esi = 0), not just cap at the ceiling like PF.
const ESI_RATE = 0.0075;
const ESI_WAGE_CEILING = 21_000;

export interface SetSalaryStructureInput {
  employeeId: string;
  basic: number;
  hra: number;
  otherAllowances: number;
}

export async function setSalaryStructure(
  input: SetSalaryStructureInput,
): Promise<void> {
  const repo = await getSalaryStructureRepository();
  await repo.upsertForEmployee(input.employeeId, {
    basic: input.basic,
    hra: input.hra,
    otherAllowances: input.otherAllowances,
  });
}

export async function getSalaryStructure(
  employeeId: string,
): Promise<SalaryStructure | null> {
  return (await getSalaryStructureRepository()).findForEmployee(employeeId);
}

/**
 * Generates and stores a payslip for one employee/period. Falls back to the
 * employee's flat monthlySalary as "basic" with no HRA/allowances when no
 * SalaryStructure has been set, so payroll works immediately without forcing
 * every tenant to configure a structure first.
 */
export async function generatePayslip(
  employeeId: string,
  periodMonth: number,
  periodYear: number,
): Promise<Payslip> {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");

  const payslipRepo = await getPayslipRepository();
  const existing = await payslipRepo.findForPeriod(employeeId, periodMonth, periodYear);
  if (existing) {
    throw new Error(`Payslip already generated for ${periodMonth}/${periodYear}`);
  }

  const employeeRepo = await getEmployeeRepository();
  const employee = await employeeRepo.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  const structure = await getSalaryStructure(employeeId);
  const basic = structure?.basic ?? employee.monthlySalary ?? 0;
  const hra = structure?.hra ?? 0;
  const otherAllowances = structure?.otherAllowances ?? 0;
  const gross = basic + hra + otherAllowances;

  const pf = Math.round(Math.min(basic, PF_WAGE_CEILING) * PF_RATE);
  const esi = gross <= ESI_WAGE_CEILING ? Math.round(gross * ESI_RATE) : 0;
  // TDS placeholder — a real income-tax slab engine (old/new regime,
  // Section 80C, etc.) is out of scope here; keep the field so payslips
  // don't need a schema change once that engine exists.
  const tds = 0;
  const totalDeductions = pf + esi + tds;
  const netPay = gross - totalDeductions;

  const payslip = await payslipRepo.insertOne(
    {
      employeeId,
      periodMonth,
      periodYear,
      basic,
      hra,
      otherAllowances,
      gross,
      pf,
      esi,
      tds,
      totalDeductions,
      netPay,
      status: "generated",
      createdAt: new Date(),
    } as Omit<Payslip, "_id" | "tenantId">,
    { action: "payslip.generated" },
  );

  await publishEvent("people/payslip.generated", {
    tenantId: ctx.tenantId,
    payslipId: payslip._id,
    employeeId,
    netPay,
  });

  return payslip;
}

export async function listPayslips(employeeId?: string): Promise<Payslip[]> {
  const repo = await getPayslipRepository();
  return employeeId ? repo.listForEmployee(employeeId) : repo.list();
}

export async function markPayslipPaid(payslipId: string): Promise<void> {
  const repo = await getPayslipRepository();
  await repo.setStatus(payslipId, "paid");
}
