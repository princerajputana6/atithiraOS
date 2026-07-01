import { runWithTenantContext } from "@atithira/db";
import { resolveActor } from "../auth-resolver";
import { can } from "../services/rbac-service";

type RouteHandler<TCtx> = (
  req: Request,
  ctx: TCtx,
) => Promise<Response> | Response;

function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Wraps a Next.js route handler so it only runs once the caller has the
 * given permission for their active tenant. Resolves the session via the
 * registered auth resolver, then runs both the permission check and the
 * wrapped handler inside the same tenant context, so nested repository
 * calls are automatically scoped without the handler doing it itself.
 *
 * Usage: `export const POST = requirePermission("tenancy.branch.manage")(handler)`
 */
export function requirePermission<TCtx = unknown>(permission: string) {
  return (handler: RouteHandler<TCtx>): RouteHandler<TCtx> => {
    return async (req: Request, ctx: TCtx) => {
      const actor = await resolveActor();
      if (!actor || !actor.tenantId) {
        return jsonError(401, "Unauthorized");
      }

      return runWithTenantContext(
        { tenantId: actor.tenantId, userId: actor.userId },
        async () => {
          const allowed = await can(actor.userId, permission);
          if (!allowed) {
            return jsonError(403, "Forbidden");
          }
          return handler(req, ctx);
        },
      );
    };
  };
}
