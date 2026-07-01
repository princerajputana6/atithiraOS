import { getTenantContext } from "@atithira/db";
import { publishEvent } from "@atithira/core-events";
import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  AttendanceStatus,
} from "@atithira/types";
import {
  getEmployeeRepository,
  getAttendanceRepository,
  getLeaveRepository,
} from "./repositories";

function requireCtx() {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");
  return ctx;
}

/* ------------------------------ Employees ---------------------------- */

export interface CreateEmployeeInput {
  name: string;
  email?: string;
  jobTitle?: string;
  department?: string;
  employmentType?: string;
  monthlySalary?: number;
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  const ctx = requireCtx();
  const repo = await getEmployeeRepository();
  const employee = await repo.insertOne({
    name: input.name,
    email: input.email,
    jobTitle: input.jobTitle,
    department: input.department,
    employmentType: input.employmentType ?? "full_time",
    joinDate: new Date(),
    monthlySalary: input.monthlySalary,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Employee, "_id" | "tenantId">);

  await publishEvent("people/employee.hired", {
    tenantId: ctx.tenantId,
    employeeId: String(employee._id),
    name: employee.name,
  });

  return employee;
}

export async function listEmployees(): Promise<Employee[]> {
  return (await getEmployeeRepository()).list();
}

/* ------------------------------ Attendance --------------------------- */

export interface MarkAttendanceInput {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
}

export async function markAttendance(
  input: MarkAttendanceInput,
): Promise<AttendanceRecord> {
  const repo = await getAttendanceRepository();
  return repo.insertOne({
    employeeId: input.employeeId,
    date: input.date,
    status: input.status,
    checkIn: input.checkIn ?? null,
    checkOut: input.checkOut ?? null,
    createdAt: new Date(),
  } as Omit<AttendanceRecord, "_id" | "tenantId">);
}

export async function listAttendance(): Promise<AttendanceRecord[]> {
  return (await getAttendanceRepository()).list();
}

/* -------------------------------- Leave ------------------------------ */

export interface RequestLeaveInput {
  employeeId: string;
  type: string;
  fromDate: string;
  toDate: string;
  reason?: string;
}

export async function requestLeave(
  input: RequestLeaveInput,
): Promise<LeaveRequest> {
  const ctx = requireCtx();
  const repo = await getLeaveRepository();
  const leave = await repo.insertOne({
    employeeId: input.employeeId,
    type: input.type,
    fromDate: input.fromDate,
    toDate: input.toDate,
    reason: input.reason,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<LeaveRequest, "_id" | "tenantId">);

  await publishEvent("people/leave.requested", {
    tenantId: ctx.tenantId,
    leaveId: String(leave._id),
    employeeId: input.employeeId,
  });

  return leave;
}

export async function listLeave(): Promise<LeaveRequest[]> {
  return (await getLeaveRepository()).list();
}

export async function decideLeave(
  leaveId: string,
  approve: boolean,
): Promise<void> {
  const repo = await getLeaveRepository();
  await repo.setStatus(leaveId, approve ? "approved" : "rejected");
}
