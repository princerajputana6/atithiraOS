export type PlanKey = "free" | "starter" | "growth" | "enterprise";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export interface Plan {
  _id: string;
  key: PlanKey;
  name: string;
  priceMonthly: number;
  limits: Record<string, number>;
  features: string[];
}

export interface Subscription {
  _id: string;
  tenantId: string;
  planKey: PlanKey;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}
