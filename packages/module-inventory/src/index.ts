export { INVENTORY_PERMISSIONS, PROCUREMENT_PERMISSIONS } from "./permissions";
export {
  getProductRepository,
  getStockMovementRepository,
} from "./repositories";
export {
  createProduct,
  listProducts,
  adjustStock,
  type CreateProductInput,
  type AdjustStockInput,
} from "./services";
export {
  getVendorRepository,
  getPurchaseOrderRepository,
} from "./procurement-repositories";
export {
  createVendor,
  listVendors,
  createPurchaseOrder,
  listPurchaseOrders,
  receivePurchaseOrder,
  type CreateVendorInput,
  type CreatePurchaseOrderInput,
} from "./procurement-service";
