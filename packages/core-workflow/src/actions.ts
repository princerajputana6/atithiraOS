import type { WorkflowAction } from "@atithira/types";
import { getNotificationRepository } from "./repositories";

export interface ActionContext {
  tenantId: string;
  ruleName: string;
  eventName: string;
  eventData: Record<string, unknown>;
}

export type ActionHandler = (
  action: WorkflowAction,
  ctx: ActionContext,
) => Promise<void>;

// Cross-module actions (e.g. create_task → module-projects) register here at
// app boot, so core-workflow never depends on a module package — same pattern
// as @atithira/db's audit hook. The "notify" action is built in because it
// only touches this package's own Notification collection.
const registry = new Map<string, ActionHandler>();

export function registerWorkflowAction(
  type: string,
  handler: ActionHandler,
): void {
  registry.set(type, handler);
}

const notifyHandler: ActionHandler = async (action, ctx) => {
  const repo = await getNotificationRepository();
  const message = interpolate(
    action.config.message ?? `Triggered by ${ctx.eventName}`,
    ctx.eventData,
  );
  await repo.insertOne(
    {
      message,
      read: false,
      source: ctx.ruleName,
      createdAt: new Date(),
    } as never,
    { skipAudit: true },
  );
};

export async function runAction(
  action: WorkflowAction,
  ctx: ActionContext,
): Promise<void> {
  if (action.type === "notify") {
    await notifyHandler(action, ctx);
    return;
  }
  const handler = registry.get(action.type);
  if (handler) await handler(action, ctx);
}

/** Replaces {{field}} placeholders with values from the event payload. */
function interpolate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    data[key] != null ? String(data[key]) : "",
  );
}
