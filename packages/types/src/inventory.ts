export interface Product {
  _id: string;
  tenantId: string;
  sku: string;
  name: string;
  category?: string;
  unitPrice: number;
  currency: string;
  stockQty: number;
  reorderLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export type StockMovementType = "in" | "out" | "adjust";

export interface StockMovement {
  _id: string;
  tenantId: string;
  productId: string;
  type: StockMovementType;
  qty: number;
  note?: string;
  createdAt: Date;
}

/* ------------------------------ Procurement ------------------------------ */

export interface Vendor {
  _id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PurchaseOrderStatus = "draft" | "sent" | "received" | "cancelled";

export interface PurchaseOrderLine {
  productId: string;
  /** Snapshot of the product name at PO time, so the line reads correctly even if the product is later renamed. */
  productName: string;
  qty: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  _id: string;
  tenantId: string;
  number: string;
  vendorId: string;
  vendorName: string; // snapshot, same rationale as line.productName
  status: PurchaseOrderStatus;
  lines: PurchaseOrderLine[];
  total: number;
  currency: string;
  receivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
