import {
  PEOPLE_PERMISSIONS,
  listLeave,
  requestLeave,
} from "@atithira/module-people";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.LEAVE_READ, async () => {
    const leave = await listLeave();
    return { leave };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.LEAVE_WRITE, async () => {
    if (!body.employeeId || !body.type || !body.fromDate || !body.toDate) {
      throw new Error("employeeId, type, fromDate, and toDate are required");
    }
    const leave = await requestLeave(body);
    return { leave };
  });
}
