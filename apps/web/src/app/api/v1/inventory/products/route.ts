import {
  INVENTORY_PERMISSIONS,
  listProducts,
  createProduct,
} from "@atithira/module-inventory";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("inventory", INVENTORY_PERMISSIONS.PRODUCT_READ, async () => {
    const products = await listProducts();
    return { products };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("inventory", INVENTORY_PERMISSIONS.PRODUCT_WRITE, async () => {
    if (!body.sku || !body.name) throw new Error("sku and name are required");
    if (typeof body.unitPrice !== "number") throw new Error("unitPrice must be a number");
    const product = await createProduct(body);
    return { product };
  });
}
