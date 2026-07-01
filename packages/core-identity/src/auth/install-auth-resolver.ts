import { registerAuthResolver } from "@atithira/core-security";
import { getActiveTenantIdForUser } from "@atithira/core-tenancy";

/**
 * Wires this package's session mechanism into core-security's
 * requirePermission() without core-security statically importing
 * core-identity (see core-security/src/auth-resolver.ts for why). Must be
 * called once at app boot, before any protected route handler runs.
 *
 * auth-config.ts is imported lazily inside the callback, not at module load
 * time: it transitively reaches @node-rs/argon2's native binding, which
 * Next.js's instrumentation.ts bundler can't handle even when the package is
 * listed in serverExternalPackages (this function is called from
 * instrumentation.ts at boot). Route handlers/RSCs that import auth-config.ts
 * directly (via "@atithira/core-identity/auth") are unaffected — this is
 * specifically an instrumentation.ts bundling quirk.
 */
export function installAuthResolver(): void {
  registerAuthResolver(async () => {
    const { auth } = await import("./auth-config");
    const session = await auth();
    if (!session?.user?.id) return null;
    const tenantId = await getActiveTenantIdForUser(session.user.id);
    return { userId: session.user.id, tenantId };
  });
}
