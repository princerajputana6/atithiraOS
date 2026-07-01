import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection } from "mongodb";
import type { Vendor, PurchaseOrder, PurchaseOrderStatus } from "@atithira/types";

export class VendorRepository extends TenantScopedRepository<Vendor> {
  protected readonly targetType = "vendor";
  constructor(collection: Collection<Vendor>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
}

export class PurchaseOrderRepository extends TenantScopedRepository<PurchaseOrder> {
  protected readonly targetType = "purchase_order";
  constructor(collection: Collection<PurchaseOrder>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  setStatus(id: string, status: PurchaseOrderStatus, receivedAt?: Date) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      {
        $set: {
          status,
          updatedAt: new Date(),
          ...(receivedAt ? { receivedAt } : {}),
        },
      },
      { action: `purchase_order.${status}` },
    );
  }
}

export async function getVendorRepository() {
  const db = await getDb();
  return new VendorRepository(db.collection<Vendor>("procurement_vendors"));
}

export async function getPurchaseOrderRepository() {
  const db = await getDb();
  return new PurchaseOrderRepository(
    db.collection<PurchaseOrder>("procurement_purchase_orders"),
  );
}
