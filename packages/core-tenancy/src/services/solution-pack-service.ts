import type { ModuleKey } from "@atithira/types";
import { MODULE_CATALOG, getSolutionPack } from "@atithira/types";
import { getTenantConfigRepository } from "../collections";

/**
 * Applies an Industry Solution Pack to the current tenant (MASTER_PLAN §7):
 * enables exactly the pack's modules, stores the industry + captured intake +
 * terminology, and applies the pack's regional defaults. Pure configuration —
 * no code fork per vertical. Call inside runWithTenantContext for the new
 * tenant, right after provisioning.
 */
export async function applySolutionPack(
  packKey: string,
  intake: Record<string, string> = {},
  modulesOverride?: ModuleKey[],
): Promise<void> {
  const pack = getSolutionPack(packKey);
  if (!pack) throw new Error(`Unknown solution pack: ${packKey}`);

  // The admin may hand-pick modules (manual override); otherwise use the
  // pack's default set. Either way we write an explicit on/off for every
  // catalog module so the granted set is exact and auditable.
  const chosen = new Set<ModuleKey>(
    (modulesOverride && modulesOverride.length > 0
      ? modulesOverride
      : pack.modules) as ModuleKey[],
  );
  const featureFlags: Record<string, boolean> = {};
  for (const mod of MODULE_CATALOG) {
    featureFlags[mod.key] = chosen.has(mod.key as ModuleKey);
  }

  const configRepo = await getTenantConfigRepository();
  await configRepo.updateForTenant({
    $set: {
      industryPack: pack.key,
      terminology: pack.terminology,
      intake,
      featureFlags,
      currency: pack.defaults.currency,
      locale: pack.defaults.locale,
      timezone: pack.defaults.timezone,
    },
  });
}
