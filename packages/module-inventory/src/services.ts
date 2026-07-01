import { getTenantContext } from "@atithira/db";
import { publishEvent } from "@atithira/core-events";
import type { Product, StockMovement, StockMovementType } from "@atithira/types";
import {
  getProductRepository,
  getStockMovementRepository,
} from "./repositories";

function requireCtx() {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");
  return ctx;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  category?: string;
  unitPrice: number;
  currency?: string;
  stockQty?: number;
  reorderLevel?: number;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const repo = await getProductRepository();
  return repo.insertOne({
    sku: input.sku,
    name: input.name,
    category: input.category,
    unitPrice: input.unitPrice,
    currency: input.currency ?? "INR",
    stockQty: input.stockQty ?? 0,
    reorderLevel: input.reorderLevel ?? 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Product, "_id" | "tenantId">);
}

export async function listProducts(): Promise<Product[]> {
  return (await getProductRepository()).list();
}

export interface AdjustStockInput {
  productId: string;
  type: StockMovementType;
  qty: number;
  note?: string;
}

/**
 * Records a stock movement, recomputes on-hand quantity, and emits
 * inventory/stock.low when the product drops to or below its reorder level.
 */
export async function adjustStock(input: AdjustStockInput): Promise<Product> {
  const ctx = requireCtx();
  const productRepo = await getProductRepository();
  const product = await productRepo.findById(input.productId);
  if (!product) throw new Error("Product not found");

  const delta =
    input.type === "in"
      ? input.qty
      : input.type === "out"
        ? -input.qty
        : input.qty - product.stockQty; // adjust = set to qty
  const newQty = Math.max(0, product.stockQty + (input.type === "adjust" ? delta : delta));

  const movementRepo = await getStockMovementRepository();
  await movementRepo.insertOne({
    productId: input.productId,
    type: input.type,
    qty: input.qty,
    note: input.note,
    createdAt: new Date(),
  } as Omit<StockMovement, "_id" | "tenantId">);

  await productRepo.setStock(input.productId, newQty);

  if (newQty <= product.reorderLevel) {
    await publishEvent("inventory/stock.low", {
      tenantId: ctx.tenantId,
      productId: input.productId,
      sku: product.sku,
      stockQty: newQty,
    });
  }

  return { ...product, stockQty: newQty };
}
