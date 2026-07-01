import { CLINIC_PERMISSIONS, listAppointments, createAppointment } from "@atithira/module-clinic";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("clinic", CLINIC_PERMISSIONS.APPOINTMENT_READ, async () => {
    const appointments = await listAppointments();
    return { appointments };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("clinic", CLINIC_PERMISSIONS.APPOINTMENT_WRITE, async () => {
    if (!body.patientId || !body.date || !body.time) {
      throw new Error("patientId, date, and time are required");
    }
    const appointment = await createAppointment(body);
    return { appointment };
  });
}
