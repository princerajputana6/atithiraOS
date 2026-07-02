let bootstrapPromise: Promise<void> | null = null;
let seedingStarted = false;

/**
 * In-memory wiring that MUST be in place before any request is handled: the
 * audit hook, the auth resolver, and the workflow-action bridge. All are
 * synchronous, process-local registrations — no DB, no network — so awaiting
 * this is effectively free.
 */
async function installHooks(): Promise<void> {
  const { installAuditHook } = await import("@atithira/core-security");
  const { installAuthResolver } = await import(
    "@atithira/core-identity/auth-resolver"
  );
  const { registerWorkflowActions } = await import("@/lib/runtime-hooks");
  const { startTracing } = await import("@atithira/core-observability");

  startTracing();
  installAuditHook();
  installAuthResolver();
  // Installs the audit hook (again — idempotent) + the create_task workflow
  // action bridge. Shared with the Inngest route so both paths behave alike.
  registerWorkflowActions();
}

/**
 * Idempotent one-time DB setup: index creation + default plan / first-party
 * listing seeds. Intentionally NOT awaited by request handlers — it used to
 * add ~15 (cross-region) round trips to the first request of every cold
 * serverless instance. Fire-and-forget: indexes only speed up queries (not
 * required for correctness) and the seeds are read with graceful fallbacks, so
 * a request that races ahead of seeding still works.
 */
async function seedOnce(): Promise<void> {
  const { ensureIdentityIndexes } = await import(
    "@atithira/core-identity/ensure-indexes"
  );
  const { seedDefaultPlans } = await import("@atithira/core-billing");
  const { seedFirstPartyListings } = await import("@atithira/core-marketplace");

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
 * Call and await at the top of every route handler that touches tenant-scoped
 * data or auth. Awaits only the fast in-memory wiring; kicks off the one-time
 * idempotent DB seeding in the background so it never blocks request latency.
 */
export function ensureBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = installHooks();
    if (!seedingStarted) {
      seedingStarted = true;
      // Best-effort; if it fails (transient DB error) the next cold start
      // retries. Never awaited on the request path.
      void seedOnce().catch(() => {});
    }
  }
  return bootstrapPromise;
}
