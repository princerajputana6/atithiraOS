import { getTenantContext } from "@atithira/db";
import type {
  Vendor,
  PurchaseOrder,
  PurchaseOrderLine,
} from "@atithira/types";
import {
  getVendorRepository,
  getPurchaseOrderRepository,
} from "./procurement-repositories";
import { getProductRepository } from "./repositories";
import { adjustStock } from "./services";

function requireCtx() {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");
  return ctx;
}

/* -------------------------------- Vendors -------------------------------- */

export interface CreateVendorInput {
  name: string;
  email?: string;
  phone?: string;
}

export async function createVendor(input: CreateVendorInput): Promise<Vendor> {
  const repo = await getVendorRepository();
  return repo.insertOne({
    name: input.name,
    email: input.email,
    phone: input.phone,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Vendor, "_id" | "tenantId">);
}

export async function listVendors(): Promise<Vendor[]> {
  return (await getVendorRepository()).list();
}

/* ----------------------------- Purchase Orders ---------------------------- */

export interface CreatePurchaseOrderInput {
  vendorId: string;
  lines: { productId: string; qty: number; unitPrice: number }[];
}

export async function createPurchaseOrder(
  input: CreatePurchaseOrderInput,
): Promise<PurchaseOrder> {
  if (input.lines.length === 0) throw new Error("A purchase order needs at least one line");

  const vendorRepo = await getVendorRepository();
  const vendor = await vendorRepo.findById(input.vendorId);
  if (!vendor) throw new Error("Vendor not found");

  const productRepo = await getProductRepository();
  const lines: PurchaseOrderLine[] = [];
  for (const line of input.lines) {
    const product = await productRepo.findById(line.productId);
    if (!product) throw new Error(`Product ${line.productId} not found`);
    lines.push({
      productId: line.productId,
      productName: product.name,
      qty: line.qty,
      unitPrice: line.unitPrice,
    });
  }

  const total = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const number = `PO-${Date.now().toString().slice(-8)}`;

  const poRepo = await getPurchaseOrderRepository();
  return poRepo.insertOne(
    {
      number,
      vendorId: input.vendorId,
      vendorName: vendor.name,
      status: "draft",
      lines,
      total,
      currency: "INR",
      receivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<PurchaseOrder, "_id" | "tenantId">,
    { action: "purchase_order.created" },
  );
}

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  return (await getPurchaseOrderRepository()).list();
}

/**
 * Receiving a PO is the procurement→inventory loop that demonstrates the
 * unified data model: it marks the PO received and pushes each line's quantity
 * into stock via the same adjustStock path products use, so movements are
 * recorded and low-stock events still fire correctly. Idempotent — a PO can
 * only be received once.
 */
export async function receivePurchaseOrder(poId: string): Promise<PurchaseOrder> {
  requireCtx();
  const poRepo = await getPurchaseOrderRepository();
  const po = await poRepo.findById(poId);
  if (!po) throw new Error("Purchase order not found");
  if (po.status === "received") throw new Error("Purchase order already received");
  if (po.status === "cancelled") throw new Error("Cannot receive a cancelled purchase order");

  for (const line of po.lines) {
    await adjustStock({
      productId: line.productId,
      type: "in",
      qty: line.qty,
      note: `Received via ${po.number}`,
    });
  }

  const receivedAt = new Date();
  await poRepo.setStatus(poId, "received", receivedAt);
  return { ...po, status: "received", receivedAt };
}
