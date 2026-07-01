import {
  PEOPLE_PERMISSIONS,
  listAttendance,
  markAttendance,
} from "@atithira/module-people";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.ATTENDANCE_READ, async () => {
    const attendance = await listAttendance();
    return { attendance };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.ATTENDANCE_WRITE, async () => {
    if (!body.employeeId || !body.date || !body.status) {
      throw new Error("employeeId, date, and status are required");
    }
    const record = await markAttendance(body);
    return { record };
  });
}
