import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import type { WorkflowRule, Notification } from "@atithira/types";

export class WorkflowRuleRepository extends TenantScopedRepository<WorkflowRule> {
  protected readonly targetType = "workflow_rule";
  constructor(collection: Collection<WorkflowRule>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  listEnabledForEvent(triggerEvent: string) {
    return this.find({ triggerEvent, enabled: true } as Filter<WorkflowRule>);
  }
  setEnabled(id: string, enabled: boolean) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { enabled, updatedAt: new Date() } },
      { action: `workflow_rule.${enabled ? "enabled" : "disabled"}` },
    );
  }
}

export class NotificationRepository extends TenantScopedRepository<Notification> {
  protected readonly targetType = "notification";
  constructor(collection: Collection<Notification>) {
    super(collection);
  }
  async list(limit = 50) {
    const tenantId = this.requireTenantId();
    return this.collection
      .find({ tenantId } as Filter<Notification>)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
  markRead(id: string) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { read: true } },
      { skipAudit: true },
    );
  }
}

export async function getWorkflowRuleRepository() {
  const db = await getDb();
  return new WorkflowRuleRepository(
    db.collection<WorkflowRule>("workflow_rules"),
  );
}
export async function getNotificationRepository() {
  const db = await getDb();
  return new NotificationRepository(
    db.collection<Notification>("workflow_notifications"),
  );
}
