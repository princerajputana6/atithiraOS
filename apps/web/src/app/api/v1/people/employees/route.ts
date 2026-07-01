import {
  PEOPLE_PERMISSIONS,
  listEmployees,
  createEmployee,
} from "@atithira/module-people";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.EMPLOYEE_READ, async () => {
    const employees = await listEmployees();
    return { employees };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("people", PEOPLE_PERMISSIONS.EMPLOYEE_WRITE, async () => {
    if (!body.name) throw new Error("name is required");
    const employee = await createEmployee(body);
    return { employee };
  });
}
