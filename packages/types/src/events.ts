export interface TenantCreatedEvent {
  name: "tenant/created";
  data: {
    tenantId: string;
    ownerUserId: string;
    ownerEmail: string;
    organizationName: string;
  };
}

export interface UserInvitedEvent {
  name: "user/invited";
  data: {
    tenantId: string;
    organizationName: string;
    inviteId: string;
    email: string;
    invitedByUserId: string;
    /** Raw (unhashed) invite token, carried only in-transit for the email link — never persisted in plaintext. */
    token: string;
  };
}

export interface UserInviteAcceptedEvent {
  name: "user/invite.accepted";
  data: {
    tenantId: string;
    userId: string;
    inviteId: string;
  };
}

export interface CrmLeadCreatedEvent {
  name: "crm/lead.created";
  data: {
    tenantId: string;
    leadId: string;
    name: string;
    ownerUserId: string;
  };
}

export interface CrmDealWonEvent {
  name: "crm/deal.won";
  data: {
    tenantId: string;
    dealId: string;
    title: string;
    amount: number;
    currency: string;
  };
}

export interface FinanceInvoicePaidEvent {
  name: "finance/invoice.paid";
  data: {
    tenantId: string;
    invoiceId: string;
    number: string;
    total: number;
    currency: string;
  };
}

export interface FinanceExpenseApprovedEvent {
  name: "finance/expense.approved";
  data: {
    tenantId: string;
    expenseId: string;
    amount: number;
  };
}

export interface PeopleEmployeeHiredEvent {
  name: "people/employee.hired";
  data: {
    tenantId: string;
    employeeId: string;
    name: string;
  };
}

export interface PeopleLeaveRequestedEvent {
  name: "people/leave.requested";
  data: {
    tenantId: string;
    leaveId: string;
    employeeId: string;
  };
}

export interface PeoplePayslipGeneratedEvent {
  name: "people/payslip.generated";
  data: {
    tenantId: string;
    payslipId: string;
    employeeId: string;
    netPay: number;
  };
}

export interface InventoryStockLowEvent {
  name: "inventory/stock.low";
  data: {
    tenantId: string;
    productId: string;
    sku: string;
    stockQty: number;
  };
}

export interface ProjectsTaskCompletedEvent {
  name: "projects/task.completed";
  data: {
    tenantId: string;
    taskId: string;
    projectId: string;
  };
}

export interface RestaurantOrderPlacedEvent {
  name: "restaurant/order.placed";
  data: { tenantId: string; orderId: string; total: number };
}

export interface RestaurantOrderPaidEvent {
  name: "restaurant/order.paid";
  data: { tenantId: string; orderId: string; number: string; total: number; currency: string };
}

export interface HotelBookingCreatedEvent {
  name: "hotel/booking.created";
  data: { tenantId: string; bookingId: string; total: number };
}
export interface ClinicAppointmentBookedEvent {
  name: "clinic/appointment.booked";
  data: { tenantId: string; appointmentId: string; patientId: string };
}
export interface RetailSaleCompletedEvent {
  name: "retail/sale.completed";
  data: { tenantId: string; saleId: string; number: string; total: number; currency: string };
}

export type DomainEvent =
  | TenantCreatedEvent
  | UserInvitedEvent
  | UserInviteAcceptedEvent
  | CrmLeadCreatedEvent
  | CrmDealWonEvent
  | FinanceInvoicePaidEvent
  | FinanceExpenseApprovedEvent
  | PeopleEmployeeHiredEvent
  | PeopleLeaveRequestedEvent
  | PeoplePayslipGeneratedEvent
  | InventoryStockLowEvent
  | ProjectsTaskCompletedEvent
  | RestaurantOrderPlacedEvent
  | RestaurantOrderPaidEvent
  | HotelBookingCreatedEvent
  | ClinicAppointmentBookedEvent
  | RetailSaleCompletedEvent;

export type EventName = DomainEvent["name"];

export type EventDataFor<N extends EventName> = Extract<
  DomainEvent,
  { name: N }
>["data"];
