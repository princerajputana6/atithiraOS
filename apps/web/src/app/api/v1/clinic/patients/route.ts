import { CLINIC_PERMISSIONS, listPatients, createPatient } from "@atithira/module-clinic";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("clinic", CLINIC_PERMISSIONS.PATIENT_READ, async () => {
    const patients = await listPatients();
    return { patients };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("clinic", CLINIC_PERMISSIONS.PATIENT_WRITE, async () => {
    if (!body.name) throw new Error("name is required");
    const patient = await createPatient({
      name: body.name,
      phone: body.phone,
      gender: body.gender,
      age: body.age ? Number(body.age) : undefined,
      notes: body.notes,
    });
    return { patient };
  });
}
