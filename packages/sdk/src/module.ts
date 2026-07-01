/**
 * Manifest a third-party developer authors to describe their marketplace
 * module. defineModule() is a typed helper that validates the shape and
 * returns it ready to publish via AtithiraClient.publishModule().
 */
export interface ModuleManifest {
  /** URL-safe unique slug, e.g. "acme-loyalty". */
  slug: string;
  name: string;
  description: string;
  /** Monthly price in the smallest currency unit's whole amount (INR). 0 = free. */
  priceMonthly?: number;
  /** Resource-action permission strings this module needs, e.g. "acme.points.write". */
  permissions?: string[];
  /** Platform domain events this module reacts to, e.g. "crm/deal.won". */
  subscribesTo?: string[];
}

export function defineModule(manifest: ModuleManifest): ModuleManifest {
  if (!manifest.slug || !/^[a-z0-9-]+$/.test(manifest.slug)) {
    throw new Error("Module slug must be lowercase alphanumeric with dashes");
  }
  if (!manifest.name || !manifest.description) {
    throw new Error("Module name and description are required");
  }
  return manifest;
}
