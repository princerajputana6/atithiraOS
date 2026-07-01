import { answerQuestion } from "@atithira/core-ai";
import { tenantApiForModule } from "@/lib/api";

// Any tenant member can query the copilot over their own data; permission
// gating beyond tenant membership can tighten later. Reuses the tenant-scoped
// wrapper so the snapshot only ever sees this tenant's data.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { question?: string };
  return tenantApiForModule("intelligence", "workflow.notification.read", async () => {
    if (!body.question) throw new Error("question is required");
    const answer = await answerQuestion(body.question);
    return { answer };
  });
}
