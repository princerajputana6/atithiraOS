export const INVENTORY_PERMISSIONS = {
  PRODUCT_READ: "inventory.product.read",
  PRODUCT_WRITE: "inventory.product.write",
  STOCK_WRITE: "inventory.stock.write",
} as const;

export const PROCUREMENT_PERMISSIONS = {
  VENDOR_READ: "procurement.vendor.read",
  VENDOR_WRITE: "procurement.vendor.write",
  PO_READ: "procurement.po.read",
  PO_WRITE: "procurement.po.write",
  PO_RECEIVE: "procurement.po.receive",
} as const;
