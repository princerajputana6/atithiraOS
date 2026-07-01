import {
  FINANCE_PERMISSIONS,
  listExpenses,
  createExpense,
} from "@atithira/module-finance";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("finance", FINANCE_PERMISSIONS.EXPENSE_READ, async () => {
    const expenses = await listExpenses();
    return { expenses };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("finance", FINANCE_PERMISSIONS.EXPENSE_WRITE, async () => {
    if (!body.description) throw new Error("description is required");
    if (typeof body.amount !== "number") throw new Error("amount must be a number");
    const expense = await createExpense(body);
    return { expense };
  });
}
