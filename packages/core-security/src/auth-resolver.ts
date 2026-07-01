export interface ResolvedActor {
  userId: string;
  tenantId: string | null;
}

export type AuthResolver = () => Promise<ResolvedActor | null>;

// core-identity owns the actual session mechanism (Auth.js). To avoid a
// circular package dependency (core-identity may need core-security for role
// assignment during invite-accept), core-security never imports
// core-identity directly. Instead apps/web registers a resolver once at boot
// that wraps core-identity's auth(), mirroring the pattern used for the
// audit-hook in @atithira/db.
let authResolver: AuthResolver | null = null;

export function registerAuthResolver(resolver: AuthResolver): void {
  authResolver = resolver;
}

export async function resolveActor(): Promise<ResolvedActor | null> {
  if (!authResolver) {
    throw new Error(
      "No auth resolver registered. Call registerAuthResolver() at app boot before using requirePermission().",
    );
  }
  return authResolver();
}
