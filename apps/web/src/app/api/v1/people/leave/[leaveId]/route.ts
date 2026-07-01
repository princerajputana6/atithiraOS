import { PEOPLE_PERMISSIONS, decideLeave } from "@atithira/module-people";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ leaveId: string }> },
) {
  const { leaveId } = await params;
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.LEAVE_APPROVE, async () => {
    if (body.action !== "approve" && body.action !== "reject") {
      throw new Error("action must be approve or reject");
    }
    await decideLeave(leaveId, body.action === "approve");
    return { ok: true };
  });
}
