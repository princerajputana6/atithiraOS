import { TenantScopedRepository, getDb, getTenantContext } from "@atithira/db";
import { publishEvent } from "@atithira/core-events";
import { listProducts, adjustStock } from "@atithira/module-inventory";
import type { Collection } from "mongodb";
import type { Sale, SaleLine } from "@atithira/types";

export const RETAIL_PERMISSIONS = {
  SALE_READ: "retail.sale.read",
  SALE_WRITE: "retail.sale.write",
} as const;

class SaleRepository extends TenantScopedRepository<Sale> {
  protected readonly targetType = "sale";
  constructor(c: Collection<Sale>) {
    super(c);
  }
  list() {
    return this.find({});
  }
}
async function sales() {
  return new SaleRepository((await getDb()).collection<Sale>("retail_sales"));
}
function ctx() {
  const c = getTenantContext();
  if (!c?.tenantId) throw new Error("Missing tenant context");
  return c;
}

export interface CheckoutInput {
  items: { productId: string; qty: number }[];
  paymentMethod?: string;
  taxRate?: number;
}

/**
 * Point-of-sale checkout: prices resolved from inventory, stock decremented
 * for each line (the retail → inventory unified-data link), and a sale record
 * written. Emits retail/sale.completed.
 */
export async function checkout(input: CheckoutInput): Promise<Sale> {
  const c = ctx();
  if (!input.items?.length) throw new Error("A sale needs at least one item");

  const products = await listProducts();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines: SaleLine[] = input.items.map((it) => {
    const p = byId.get(it.productId);
    if (!p) throw new Error(`Unknown product: ${it.productId}`);
    if (p.stockQty < it.qty) throw new Error(`Not enough stock for ${p.name}`);
    return { productId: it.productId, name: p.name, qty: it.qty, price: p.unitPrice };
  });

  // Decrement stock through the inventory module (audited stock movements).
  for (const line of lines) {
    await adjustStock({ productId: line.productId, type: "out", qty: line.qty, note: "POS sale" });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const taxRate = input.taxRate ?? 18;
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxAmount;

  const repo = await sales();
  const sale = await repo.insertOne(
    {
      number: `SALE-${Date.now().toString().slice(-8)}`,
      items: lines,
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency: "INR",
      paymentMethod: input.paymentMethod ?? "cash",
      createdAt: new Date(),
    } as Omit<Sale, "_id" | "tenantId">,
    { action: "retail_sale.completed" },
  );

  await publishEvent("retail/sale.completed", {
    tenantId: c.tenantId,
    saleId: String(sale._id),
    number: sale.number,
    total,
    currency: sale.currency,
  });
  return sale;
}

export async function listSales(): Promise<Sale[]> {
  return (await sales()).list();
}
