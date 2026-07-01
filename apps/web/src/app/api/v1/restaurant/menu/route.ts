import {
  RESTAURANT_PERMISSIONS,
  listMenu,
  createMenuItem,
} from "@atithira/module-restaurant";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.MENU_READ, async () => {
    const items = await listMenu();
    return { items };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.MENU_WRITE, async () => {
    if (!body.name || !body.category) throw new Error("name and category are required");
    if (typeof body.price !== "number") throw new Error("price must be a number");
    const item = await createMenuItem(body);
    return { item };
  });
}
