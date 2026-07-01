import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import { ensureTextIndex, textSearch } from "@atithira/core-search";
import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  LeaveStatus,
  SalaryStructure,
  Payslip,
  PayslipStatus,
} from "@atithira/types";

export class EmployeeRepository extends TenantScopedRepository<Employee> {
  protected readonly targetType = "employee";
  constructor(collection: Collection<Employee>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  async ensureSearchIndex() {
    await ensureTextIndex(this.collection, { name: "text", email: "text", jobTitle: "text" });
  }
  search(query: string) {
    return textSearch(this.collection, this.requireTenantId(), query);
  }
}

export class AttendanceRepository extends TenantScopedRepository<AttendanceRecord> {
  protected readonly targetType = "attendance";
  constructor(collection: Collection<AttendanceRecord>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
}

export class LeaveRepository extends TenantScopedRepository<LeaveRequest> {
  protected readonly targetType = "leave_request";
  constructor(collection: Collection<LeaveRequest>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  setStatus(id: string, status: LeaveStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `leave.${status}` },
    );
  }
}

export class SalaryStructureRepository extends TenantScopedRepository<SalaryStructure> {
  protected readonly targetType = "salary_structure";
  constructor(collection: Collection<SalaryStructure>) {
    super(collection);
  }
  findForEmployee(employeeId: string) {
    return this.findOne({ employeeId } as Filter<SalaryStructure>);
  }
  async upsertForEmployee(
    employeeId: string,
    input: { basic: number; hra: number; otherAllowances: number },
  ): Promise<void> {
    const tenantId = this.requireTenantId();
    await this.collection.updateOne(
      { tenantId, employeeId } as Filter<SalaryStructure>,
      { $set: { ...input, updatedAt: new Date() } },
      { upsert: true },
    );
  }
}

export class PayslipRepository extends TenantScopedRepository<Payslip> {
  protected readonly targetType = "payslip";
  constructor(collection: Collection<Payslip>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  listForEmployee(employeeId: string) {
    return this.find({ employeeId } as Filter<Payslip>);
  }
  findForPeriod(employeeId: string, periodMonth: number, periodYear: number) {
    return this.findOne({ employeeId, periodMonth, periodYear } as Filter<Payslip>);
  }
  setStatus(id: string, status: PayslipStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status } },
      { action: `payslip.${status}` },
    );
  }
}

export async function getEmployeeRepository() {
  const db = await getDb();
  return new EmployeeRepository(db.collection<Employee>("people_employees"));
}
export async function getAttendanceRepository() {
  const db = await getDb();
  return new AttendanceRepository(
    db.collection<AttendanceRecord>("people_attendance"),
  );
}
export async function getLeaveRepository() {
  const db = await getDb();
  return new LeaveRepository(db.collection<LeaveRequest>("people_leave"));
}
export async function getSalaryStructureRepository() {
  const db = await getDb();
  return new SalaryStructureRepository(
    db.collection<SalaryStructure>("people_salary_structures"),
  );
}
export async function getPayslipRepository() {
  const db = await getDb();
  return new PayslipRepository(db.collection<Payslip>("people_payslips"));
}
