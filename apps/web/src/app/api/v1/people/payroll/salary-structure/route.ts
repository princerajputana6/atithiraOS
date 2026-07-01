import {
  PEOPLE_PERMISSIONS,
  getSalaryStructure,
  setSalaryStructure,
} from "@atithira/module-people";
import { tenantApiForModule } from "@/lib/api";

export async function GET(req: Request) {
  const employeeId = new URL(req.url).searchParams.get("employeeId");
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.PAYROLL_READ, async () => {
    if (!employeeId) throw new Error("employeeId query param is required");
    const structure = await getSalaryStructure(employeeId);
    return { structure };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.PAYROLL_MANAGE, async () => {
    if (!body.employeeId) throw new Error("employeeId is required");
    await setSalaryStructure({
      employeeId: body.employeeId,
      basic: Number(body.basic) || 0,
      hra: Number(body.hra) || 0,
      otherAllowances: Number(body.otherAllowances) || 0,
    });
    return { ok: true };
  });
}
