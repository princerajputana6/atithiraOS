import { CRM_PERMISSIONS, moveDeal } from "@atithira/module-crm";
import { DEAL_STAGES, type DealStage } from "@atithira/types";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ dealId: string }> },
) {
  const { dealId } = await params;
  const body = (await req.json().catch(() => ({}))) as { stage?: DealStage };
  return tenantApiForModule("crm", CRM_PERMISSIONS.DEAL_WRITE, async () => {
    if (!body.stage || !DEAL_STAGES.includes(body.stage)) {
      throw new Error(`stage must be one of: ${DEAL_STAGES.join(", ")}`);
    }
    await moveDeal(dealId, body.stage);
    return { ok: true };
  });
}
