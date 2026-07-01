import type { ModuleKey } from "@atithira/types";
import { resolveModuleAccess } from "@atithira/types";
import { getTenantConfigRepository } from "../collections";

/**
 * Resolves the effective module-access map for the current tenant context.
 * Call inside runWithTenantContext. Returns the catalog defaults when a tenant
 * has no config yet (should not happen post-provisioning, but fail-open to the
 * defaults rather than throwing so a missing config never locks a user out).
 */
export async function getModuleAccess(): Promise<Record<ModuleKey, boolean>> {
  const configRepo = await getTenantConfigRepository();
  const config = await configRepo.getForTenant();
  return resolveModuleAccess(config?.featureFlags);
}

export async function isModuleEnabled(moduleKey: ModuleKey): Promise<boolean> {
  const access = await getModuleAccess();
  return access[moduleKey] === true;
}

/**
 * Platform-Owner action: sets a single module's entitlement for the current
 * tenant context. Persisted as an explicit override in featureFlags so the
 * grant/revoke is auditable (TenantConfigRepository writes go through the
 * audit hook).
 */
export async function setModuleEnabled(
  moduleKey: ModuleKey,
  enabled: boolean,
): Promise<void> {
  const configRepo = await getTenantConfigRepository();
  await configRepo.updateForTenant({
    $set: { [`featureFlags.${moduleKey}`]: enabled },
  });
}
