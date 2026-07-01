import { RETAIL_PERMISSIONS, listSales, checkout } from "@atithira/module-retail";
import { tenantApiForModule } from "@/lib/api";

export async function GET() {
  return tenantApiForModule("retail", RETAIL_PERMISSIONS.SALE_READ, async () => {
    const sales = await listSales();
    return { sales };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApiForModule("retail", RETAIL_PERMISSIONS.SALE_WRITE, async () => {
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new Error("items[] is required");
    }
    const sale = await checkout({ items: body.items, paymentMethod: body.paymentMethod });
    return { sale };
  });
}
