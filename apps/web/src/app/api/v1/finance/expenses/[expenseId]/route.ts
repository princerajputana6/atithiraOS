import { FINANCE_PERMISSIONS, decideExpense } from "@atithira/module-finance";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ expenseId: string }> },
) {
  const { expenseId } = await params;
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  return tenantApiForModule("finance", FINANCE_PERMISSIONS.EXPENSE_APPROVE, async () => {
    if (body.action !== "approve" && body.action !== "reject") {
      throw new Error("action must be approve or reject");
    }
    await decideExpense(expenseId, body.action === "approve");
    return { ok: true };
  });
}
