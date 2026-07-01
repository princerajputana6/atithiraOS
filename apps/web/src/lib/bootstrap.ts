let bootstrapPromise: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const { installAuditHook } = await import("@atithira/core-security");
  const { installAuthResolver } = await import(
    "@atithira/core-identity/auth-resolver"
  );
  const { ensureIdentityIndexes } = await import(
    "@atithira/core-identity/ensure-indexes"
  );
  const { seedDefaultPlans } = await import("@atithira/core-billing");
  const { seedFirstPartyListings } = await import("@atithira/core-marketplace");
  const { registerWorkflowActions } = await import("@/lib/runtime-hooks");
  const { startTracing } = await import("@atithira/core-observability");

  startTracing();
  installAuditHook();
  installAuthResolver();
  // Installs the audit hook (again — idempotent) + the create_task workflow
  // action bridge. Shared with the Inngest route so both paths behave alike.
  registerWorkflowActions();

  await ensureIdentityIndexes();
  await seedDefaultPlans();
  await seedFirstPartyListings();
  await ensureSearchIndexes();
}

/** Text indexes are collection-level, not per-tenant, so this only ever needs to run once regardless of how many tenants exist. */
async function ensureSearchIndexes(): Promise<void> {
  const { getLeadRepository, getContactRepository } = await import("@atithira/module-crm");
  const { getInvoiceRepository } = await import("@atithira/module-finance");
  const { getProductRepository } = await import("@atithira/module-inventory");
  const { getEmployeeRepository } = await import("@atithira/module-people");
  const { getTaskRepository } = await import("@atithira/module-projects");

  await Promise.all([
    getLeadRepository().then((r) => r.ensureSearchIndex()),
    getContactRepository().then((r) => r.ensureSearchIndex()),
    getInvoiceRepository().then((r) => r.ensureSearchIndex()),
    getProductRepository().then((r) => r.ensureSearchIndex()),
    getEmployeeRepository().then((r) => r.ensureSearchIndex()),
    getTaskRepository().then((r) => r.ensureSearchIndex()),
  ]);
}

/**
 * Idempotent, memoized app bootstrap — call and await this at the top of
 * every route handler that touches tenant-scoped data or auth. This replaces
 * Next.js's instrumentation.ts for this wiring: instrumentation.ts uses a
 * restricted bundler config that can't handle @node-rs/argon2's native
 * binding or mongodb's optional client-side-encryption dependency chain,
 * even with serverExternalPackages configured. Regular route handlers use
 * normal bundling, which handles both fine.
 */
export function ensureBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrap();
  }
  return bootstrapPromise;
}
