import { runWithTenantContext, getTenantContext } from "@atithira/db";
import type { WorkflowRule, WorkflowAction } from "@atithira/types";
import {
  getWorkflowRuleRepository,
  getNotificationRepository,
} from "./repositories";
import { runAction } from "./actions";

/* ------------------------------- Rules ------------------------------- */

export interface CreateRuleInput {
  name: string;
  triggerEvent: string;
  actions: WorkflowAction[];
}

export async function createRule(input: CreateRuleInput): Promise<WorkflowRule> {
  const repo = await getWorkflowRuleRepository();
  return repo.insertOne(
    {
      name: input.name,
      triggerEvent: input.triggerEvent,
      enabled: true,
      actions: input.actions,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<WorkflowRule, "_id" | "tenantId">,
    { action: "workflow_rule.created" },
  );
}

export async function listRules(): Promise<WorkflowRule[]> {
  return (await getWorkflowRuleRepository()).list();
}

export async function toggleRule(id: string, enabled: boolean): Promise<void> {
  const repo = await getWorkflowRuleRepository();
  await repo.setEnabled(id, enabled);
}

/* ---------------------------- Notifications -------------------------- */

export async function listNotifications() {
  return (await getNotificationRepository()).list();
}

export async function markNotificationRead(id: string): Promise<void> {
  const repo = await getNotificationRepository();
  await repo.markRead(id);
}

/* ----------------------------- Dispatcher ---------------------------- */

/**
 * Called by the Inngest workflow-runner for every domain event. Finds enabled
 * rules for the event's tenant that match the event name, and runs each rule's
 * actions inside that tenant's context. Failures in one action don't abort the
 * others — a bad rule shouldn't block the rest of a tenant's automation.
 */
export async function runWorkflowsForEvent(
  eventName: string,
  eventData: Record<string, unknown>,
): Promise<number> {
  const tenantId = eventData.tenantId as string | undefined;
  if (!tenantId) return 0;

  return runWithTenantContext({ tenantId, userId: null }, async () => {
    const repo = await getWorkflowRuleRepository();
    const rules = await repo.listEnabledForEvent(eventName);
    for (const rule of rules) {
      for (const action of rule.actions) {
        try {
          await runAction(action, {
            tenantId,
            ruleName: rule.name,
            eventName,
            eventData,
          });
        } catch {
          // swallow; a failing action must not stop sibling actions/rules
        }
      }
    }
    return rules.length;
  });
}

export function currentTenantId(): string | undefined {
  return getTenantContext()?.tenantId;
}
