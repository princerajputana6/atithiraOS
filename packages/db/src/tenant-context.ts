import { AsyncLocalStorage } from "node:async_hooks";

export interface TenantContext {
  tenantId: string;
  userId: string | null;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const storage = new AsyncLocalStorage<TenantContext>();

/**
 * Every request that touches tenant-scoped data must be wrapped in this once,
 * at the route boundary, before any repository call. All tenant filtering and
 * audit-log attribution downstream reads from this context.
 */
export function runWithTenantContext<T>(context: TenantContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function getTenantContext(): TenantContext | undefined {
  return storage.getStore();
}
