import { WORKFLOW_PERMISSIONS, toggleRule } from "@atithira/core-workflow";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ ruleId: string }> },
) {
  const { ruleId } = await params;
  const body = (await req.json().catch(() => ({}))) as { enabled?: boolean };
  return tenantApiForModule("automation", WORKFLOW_PERMISSIONS.RULE_WRITE, async () => {
    if (typeof body.enabled !== "boolean") {
      throw new Error("enabled boolean is required");
    }
    await toggleRule(ruleId, body.enabled);
    return { ok: true };
  });
}
