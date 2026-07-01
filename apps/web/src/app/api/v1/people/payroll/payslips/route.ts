import {
  PEOPLE_PERMISSIONS,
  listPayslips,
  generatePayslip,
} from "@atithira/module-people";
import { tenantApiForModule } from "@/lib/api";

export async function GET(req: Request) {
  const employeeId = new URL(req.url).searchParams.get("employeeId") ?? undefined;
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.PAYROLL_READ, async () => {
    const payslips = await listPayslips(employeeId);
    return { payslips };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.PAYROLL_MANAGE, async () => {
    if (!body.employeeId) throw new Error("employeeId is required");
    if (!body.periodMonth || !body.periodYear) {
      throw new Error("periodMonth and periodYear are required");
    }
    const payslip = await generatePayslip(
      body.employeeId,
      Number(body.periodMonth),
      Number(body.periodYear),
    );
    return { payslip };
  });
}
