import {
  RESTAURANT_PERMISSIONS,
  setMenuAvailability,
  deleteMenuItem,
} from "@atithira/module-restaurant";
import { tenantApiForModule } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params;
  const body = (await req.json().catch(() => ({}))) as { available?: boolean };
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.MENU_WRITE, async () => {
    if (typeof body.available !== "boolean") throw new Error("available boolean required");
    await setMenuAvailability(itemId, body.available);
    return { ok: true };
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params;
  return tenantApiForModule("restaurant", RESTAURANT_PERMISSIONS.MENU_WRITE, async () => {
    await deleteMenuItem(itemId);
    return { ok: true };
  });
}
