import { WEBSITE_PERMISSIONS, listSubmissions } from "@atithira/module-website";
import { tenantApiForModule } from "@/lib/api";

export async function GET(req: Request) {
  const formId = new URL(req.url).searchParams.get("formId") ?? undefined;
  return tenantApiForModule("website", WEBSITE_PERMISSIONS.SUBMISSION_READ, async () => {
    const submissions = await listSubmissions(formId);
    return { submissions };
  });
}
