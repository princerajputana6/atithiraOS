export type EmployeeStatus = "active" | "terminated";

export interface Employee {
  _id: string;
  tenantId: string;
  name: string;
  email?: string;
  jobTitle?: string;
  department?: string;
  employmentType?: string; // full_time, part_time, contract
  joinDate?: Date | null;
  monthlySalary?: number;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type AttendanceStatus = "present" | "absent" | "leave";

export interface AttendanceRecord {
  _id: string;
  tenantId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string | null;
  checkOut?: string | null;
  createdAt: Date;
}

export type LeaveStatus = "pending" | "approved" | "rejected";
export const LEAVE_STATUSES: LeaveStatus[] = ["pending", "approved", "rejected"];

export interface LeaveRequest {
  _id: string;
  tenantId: string;
  employeeId: string;
  type: string; // casual, sick, earned
  fromDate: string;
  toDate: string;
  reason?: string;
  status: LeaveStatus;
  createdAt: Date;
  updatedAt: Date;
}

/* -------------------------------- Payroll ----------------------------- */

/** One active structure per employee — set/replaced via setSalaryStructure. */
export interface SalaryStructure {
  _id: string;
  tenantId: string;
  employeeId: string;
  basic: number;
  hra: number;
  otherAllowances: number;
  updatedAt: Date;
}

export type PayslipStatus = "generated" | "paid";

/**
 * India-first statutory deductions, deliberately simplified (see
 * payroll-service.ts for the exact formulas): PF is EPFO's 12%-of-basic
 * rule capped at a ₹15,000 basic; ESI is 0.75% of gross when gross is at or
 * below the ₹21,000 ESI wage ceiling; TDS is a placeholder (0) pending a
 * real income-tax slab engine — do not treat these as compliance-grade.
 */
export interface Payslip {
  _id: string;
  tenantId: string;
  employeeId: string;
  periodMonth: number; // 1-12
  periodYear: number;
  basic: number;
  hra: number;
  otherAllowances: number;
  gross: number;
  pf: number;
  esi: number;
  tds: number;
  totalDeductions: number;
  netPay: number;
  status: PayslipStatus;
  createdAt: Date;
}
