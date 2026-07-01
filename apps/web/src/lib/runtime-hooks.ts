import { installAuditHook } from "@atithira/core-security";
import { registerWorkflowAction } from "@atithira/core-workflow";
import { createTask } from "@atithira/module-projects";

let installed = false;

function interpolate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    data[key] != null ? String(data[key]) : "",
  );
}

/**
 * Synchronous, idempotent registration of runtime hooks that both normal route
 * handlers (via bootstrap) and the Inngest workflow-runner need: the audit-log
 * hook, and the cross-module "create_task" workflow action that bridges
 * automation to the Projects module (keeping core-workflow decoupled from any
 * module package, the same isolation pattern as the audit hook).
 *
 * These packages (core-security, core-workflow, module-projects) don't reach
 * @node-rs/argon2, so static imports here are safe outside instrumentation.ts.
 */
export function registerWorkflowActions(): void {
  if (installed) return;
  installed = true;

  installAuditHook();

  registerWorkflowAction("create_task", async (action, ctx) => {
    if (!action.config.projectId) return;
    const title = interpolate(
      action.config.title ?? "Follow-up task",
      ctx.eventData,
    );
    await createTask({ projectId: action.config.projectId, title });
  });
}
