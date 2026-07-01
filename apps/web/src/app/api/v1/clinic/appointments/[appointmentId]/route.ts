import { CLINIC_PERMISSIONS, updateAppointmentStatus } from "@atithira/module-clinic";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@atithira/types";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  const { appointmentId } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: AppointmentStatus };
  return tenantApiForModule("clinic", CLINIC_PERMISSIONS.APPOINTMENT_WRITE, async () => {
    if (!body.status || !APPOINTMENT_STATUSES.includes(body.status)) {
      throw new Error(`status must be one of: ${APPOINTMENT_STATUSES.join(", ")}`);
    }
    await updateAppointmentStatus(appointmentId, body.status);
    return { ok: true };
  });
}
