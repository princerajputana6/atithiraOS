import { MODULE_CATALOG, type ModuleKey, type PlatformModule } from "@atithira/types";
import { getPlatformSettingsRepository } from "../collections";

export interface EffectivePlatformModule extends PlatformModule {
  /** defaultEnabled from the code catalog, overridden by a Platform Owner if one was set. */
  effectiveDefault: boolean;
}

/** The module catalog merged with any Platform-Owner overrides to the default-on set. */
export async function getEffectiveModuleCatalog(): Promise<EffectivePlatformModule[]> {
  const settingsRepo = await getPlatformSettingsRepository();
  const overrides = await settingsRepo.getModuleOverrides();
  return MODULE_CATALOG.map((mod) => ({
    ...mod,
    effectiveDefault: overrides[mod.key] ?? mod.defaultEnabled,
  }));
}

/** Platform-Owner action: changes which modules new tenants are provisioned with by default. */
export async function setPlatformModuleDefault(
  moduleKey: ModuleKey,
  enabled: boolean,
): Promise<void> {
  const settingsRepo = await getPlatformSettingsRepository();
  await settingsRepo.setModuleDefault(moduleKey, enabled);
}

/** The featureFlags map seeded onto a brand-new tenant, honoring Platform-Owner overrides. */
export async function getDefaultFeatureFlagsForNewTenant(): Promise<Record<ModuleKey, boolean>> {
  const catalog = await getEffectiveModuleCatalog();
  const result = {} as Record<ModuleKey, boolean>;
  for (const mod of catalog) result[mod.key] = mod.effectiveDefault;
  return result;
}
