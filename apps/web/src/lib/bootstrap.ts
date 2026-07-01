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

  installAuditHook();
  installAuthResolver();
  await ensureIdentityIndexes();
  await seedDefaultPlans();
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
