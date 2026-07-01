import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import { ensureTextIndex, textSearch } from "@atithira/core-search";
import type { Product, StockMovement } from "@atithira/types";

export class ProductRepository extends TenantScopedRepository<Product> {
  protected readonly targetType = "product";
  constructor(collection: Collection<Product>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  async ensureSearchIndex() {
    await ensureTextIndex(this.collection, { name: "text", sku: "text" });
  }
  search(query: string) {
    return textSearch(this.collection, this.requireTenantId(), query);
  }
  setStock(id: string, stockQty: number) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { stockQty, updatedAt: new Date() } },
      { action: "product.stock_changed" },
    );
  }
}

export class StockMovementRepository extends TenantScopedRepository<StockMovement> {
  protected readonly targetType = "stock_movement";
  constructor(collection: Collection<StockMovement>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
}

export async function getProductRepository() {
  const db = await getDb();
  return new ProductRepository(db.collection<Product>("inventory_products"));
}
export async function getStockMovementRepository() {
  const db = await getDb();
  return new StockMovementRepository(
    db.collection<StockMovement>("inventory_stock_movements"),
  );
}
