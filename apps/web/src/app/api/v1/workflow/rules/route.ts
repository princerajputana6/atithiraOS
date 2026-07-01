import {
  WORKFLOW_PERMISSIONS,
  listRules,
  createRule,
} from "@atithira/core-workflow";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("automation", WORKFLOW_PERMISSIONS.RULE_READ, async () => {
    const rules = await listRules();
    return { rules };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("automation", WORKFLOW_PERMISSIONS.RULE_WRITE, async () => {
    if (!body.name || !body.triggerEvent || !Array.isArray(body.actions)) {
      throw new Error("name, triggerEvent, and actions[] are required");
    }
    const rule = await createRule(body);
    return { rule };
  });
}
