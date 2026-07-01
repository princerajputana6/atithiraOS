import { getDb } from "@atithira/db";
import { getOrganizationRepository } from "../collections";

/**
 * Hard-deletes a tenant and everything scoped to it. Every tenant-scoped
 * collection stores a `tenantId`, so we sweep each collection with
 * deleteMany({ tenantId }) — this generically covers all module data (CRM,
 * finance, website, …) without hardcoding a collection list, so new modules
 * are cleaned up automatically. Global collections (users, plans, the org
 * root itself) carry no `tenantId` and are untouched by the sweep; the org
 * root is dropped explicitly by _id.
 *
 * Idempotent: deleting an already-gone tenant is a no-op. This is a
 * Platform-Owner-only, irreversible action — the caller gates it.
 */
export async function deleteTenant(tenantId: string): Promise<void> {
  const orgRepo = await getOrganizationRepository();
  const org = await orgRepo.findById(tenantId);
  if (!org) return;

  const db = await getDb();
  const collections = await db.listCollections().toArray();
  for (const { name } of collections) {
    await db.collection(name).deleteMany({ tenantId });
  }

  await orgRepo.deleteById(tenantId);
}
