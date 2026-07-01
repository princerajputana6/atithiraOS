export type WorkflowActionType = "notify" | "create_task";

export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, string>;
}

export interface WorkflowRule {
  _id: string;
  tenantId: string;
  name: string;
  triggerEvent: string; // e.g. "finance/invoice.paid"
  enabled: boolean;
  actions: WorkflowAction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  tenantId: string;
  message: string;
  read: boolean;
  source?: string; // e.g. workflow rule name
  createdAt: Date;
}

// Domain events a workflow rule can trigger on. Kept as a runtime list (not
// just the EventName type) so the Inngest dispatcher can subscribe to each and
// the no-code builder can offer them as options.
export const WORKFLOW_TRIGGER_EVENTS = [
  "tenant/created",
  "user/invited",
  "user/invite.accepted",
  "crm/lead.created",
  "crm/deal.won",
  "finance/invoice.paid",
  "finance/expense.approved",
  "people/employee.hired",
  "people/leave.requested",
  "people/payslip.generated",
  "inventory/stock.low",
  "projects/task.completed",
  "restaurant/order.placed",
  "restaurant/order.paid",
  "hotel/booking.created",
  "clinic/appointment.booked",
  "retail/sale.completed",
] as const;
