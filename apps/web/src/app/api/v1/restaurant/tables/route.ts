import {
  RESTAURANT_PERMISSIONS,
  listTablesWithQr,
  createTable,
} from "@atithira/module-restaurant";
import { tenantApiForModule } from "@/lib/api";
import { getRequestOrigin } from "@/lib/request-origin";

export async function GET() {
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.TABLE_MANAGE, async () => {
    const baseUrl = await getRequestOrigin();
    const tables = await listTablesWithQr(baseUrl);
    return { tables };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.TABLE_MANAGE, async () => {
    if (!body.label) throw new Error("label is required");
    const table = await createTable({ label: body.label, seats: Number(body.seats) || 2 });
    return { table };
  });
}
