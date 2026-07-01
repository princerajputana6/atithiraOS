import { describe, it, expect } from "vitest";
import { signup } from "@atithira/core-identity";
import { createOrganizationForNewUser, getModuleAccess } from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import {
  createProduct,
  createVendor,
  createPurchaseOrder,
  receivePurchaseOrder,
  getProductRepository,
} from "@atithira/module-inventory";

async function createTenant(label: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const user = await signup({
    email: `${label}-${suffix}@example.com`,
    password: "Sup3rSecret!23",
    name: `${label} Owner`,
  });
  const org = await createOrganizationForNewUser({
    organizationName: `${label} Org`,
    slug: `${label}-${suffix}`,
    ownerUserId: user._id,
    ownerEmail: user.email,
  });
  return { user, org };
}

describe("procurement → inventory loop", () => {
  it("receiving a purchase order pushes its quantities into product stock, once", async () => {
    const { user, org } = await createTenant("procurement");

    await runWithTenantContext({ tenantId: org._id, userId: user._id }, async () => {
      const product = await createProduct({ sku: "WIDGET-1", name: "Widget", unitPrice: 100, stockQty: 5 });
      const vendor = await createVendor({ name: "Acme Supplies" });

      const po = await createPurchaseOrder({
        vendorId: vendor._id,
        lines: [{ productId: product._id, qty: 10, unitPrice: 90 }],
      });
      expect(po.status).toBe("draft");
      expect(po.total).toBe(900);

      await receivePurchaseOrder(po._id);

      const productRepo = await getProductRepository();
      const updated = await productRepo.findById(product._id);
      expect(updated?.stockQty).toBe(15); // 5 starting + 10 received

      // Idempotent: a PO can only be received once.
      await expect(receivePurchaseOrder(po._id)).rejects.toThrow();
    });
  });

  it("new tenants have procurement disabled by default (Platform Owner must grant it)", async () => {
    const { user, org } = await createTenant("entitlement");
    await runWithTenantContext({ tenantId: org._id, userId: user._id }, async () => {
      const access = await getModuleAccess();
      expect(access.procurement).toBe(false);
      // Core modules are on by default.
      expect(access.crm).toBe(true);
      expect(access.finance).toBe(true);
      expect(access.inventory).toBe(true);
    });
  });
});
