import { PROCUREMENT_PERMISSIONS, listVendors, createVendor } from "@atithira/module-inventory";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("procurement", PROCUREMENT_PERMISSIONS.VENDOR_READ, async () => {
    const vendors = await listVendors();
    return { vendors };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("procurement", PROCUREMENT_PERMISSIONS.VENDOR_WRITE, async () => {
    if (!body.name) throw new Error("name is required");
    const vendor = await createVendor(body);
    return { vendor };
  });
}
