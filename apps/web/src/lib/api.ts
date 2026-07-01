import { NextResponse } from "next/server";
import { resolveActor, can } from "@atithira/core-security";
import { verifyApiKey } from "@atithira/core-developer";
import { isModuleEnabled } from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import { logger } from "@atithira/core-observability";
import type { ModuleKey } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";

/**
 * Shared wrapper for tenant-scoped, permission-gated JSON API handlers.
 * Bootstraps the app, resolves the session/tenant, checks the permission,
 * then runs the callback inside the tenant context so nested repository
 * calls are automatically scoped. Returns 401/403 as appropriate.
 */
export async function tenantApi<T>(
  permission: string,
  fn: (ctx: { userId: string; tenantId: string }) => Promise<T>,
): Promise<Response> {
  await ensureBootstrapped();
  const actor = await resolveActor();
  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runWithTenantContext(
    { tenantId: actor.tenantId, userId: actor.userId },
    async () => {
      const allowed = await can(actor.userId, permission);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return runFn(fn, actor.userId, actor.tenantId as string);
    },
  );
}

/**
 * Like tenantApi, but first checks the tenant is entitled to `moduleKey`.
 * Defense-in-depth behind the sidebar gating: even if a caller hits the URL
 * directly, a module the Platform Owner hasn't granted returns 403.
 */
export async function tenantApiForModule<T>(
  moduleKey: ModuleKey,
  permission: string,
  fn: (ctx: { userId: string; tenantId: string }) => Promise<T>,
): Promise<Response> {
  return tenantApi(permission, async (ctx) => {
    if (!(await isModuleEnabled(moduleKey))) {
      throw new ModuleDisabledError();
    }
    return fn(ctx);
  });
}

/** Thrown when a tenant reaches a module that isn't entitled — surfaced as 403, not 400. */
export class ModuleDisabledError extends Error {
  constructor() {
    super("This module is not enabled for your workspace");
    this.name = "ModuleDisabledError";
  }
}

/**
 * Like tenantApi, but also accepts an API-key bearer token (atk_...) in place
 * of a session — this is the auth path the developer SDK uses. API keys carry
 * scopes rather than RBAC roles: a "*" scope (or the exact permission) passes.
 * Falls back to session auth when no key header is present, so the same
 * endpoint serves both the dashboard UI and third-party SDK callers.
 */
export async function tenantApiOrApiKey<T>(
  req: Request,
  permission: string,
  fn: (ctx: { userId: string; tenantId: string }) => Promise<T>,
): Promise<Response> {
  await ensureBootstrapped();

  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (bearer && bearer.startsWith("atk_")) {
    const verified = await verifyApiKey(bearer);
    if (!verified) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
    const scoped =
      verified.scopes.includes("*") || verified.scopes.includes(permission);
    if (!scoped) {
      return NextResponse.json(
        { error: "API key lacks scope" },
        { status: 403 },
      );
    }
    return runWithTenantContext(
      { tenantId: verified.tenantId, userId: null },
      async () => runFn(fn, `apikey:${verified.keyId}`, verified.tenantId),
    );
  }

  return tenantApi(permission, fn);
}

async function runFn<T>(
  fn: (ctx: { userId: string; tenantId: string }) => Promise<T>,
  userId: string,
  tenantId: string,
): Promise<Response> {
  try {
    const result = await fn({ userId, tenantId });
    return NextResponse.json(result ?? { ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    // Expected validation errors (bad input, business-rule violations) don't
    // need a stack trace in the logs; log at warn so error-level alerting
    // stays reserved for genuinely unexpected failures.
    logger.warn({ err, userId, tenantId }, message);
    const status = err instanceof ModuleDisabledError ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
