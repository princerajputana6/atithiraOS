import { FINANCE_PERMISSIONS, getTrialBalance, listAccounts } from "@atithira/module-finance";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("finance", FINANCE_PERMISSIONS.GL_READ, async () => {
    const [trialBalance, accounts] = await Promise.all([
      getTrialBalance(),
      listAccounts(),
    ]);
    return { trialBalance, accounts };
  });
}
