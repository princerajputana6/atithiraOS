import { PEOPLE_PERMISSIONS, markPayslipPaid } from "@atithira/module-people";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ payslipId: string }> },
) {
  const { payslipId } = await params;
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.PAYROLL_MANAGE, async () => {
    if (body.action !== "mark_paid") throw new Error("action must be mark_paid");
    await markPayslipPaid(payslipId);
    return { ok: true };
  });
}
