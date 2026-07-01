import { getDb } from "@atithira/db";
import type { Plan, Subscription } from "@atithira/types";
import { PlanRepository } from "./repositories/plan-repository";
import { SubscriptionRepository } from "./repositories/subscription-repository";

export async function getPlanRepository(): Promise<PlanRepository> {
  const db = await getDb();
  return new PlanRepository(db.collection<Plan>("plans"));
}

export async function getSubscriptionRepository(): Promise<SubscriptionRepository> {
  const db = await getDb();
  return new SubscriptionRepository(db.collection<Subscription>("subscriptions"));
}
