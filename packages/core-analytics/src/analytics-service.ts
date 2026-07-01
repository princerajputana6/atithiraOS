import { getAuditLogRepository } from "@atithira/core-security";

/**
 * The platform Analytics Service. Ingestion is deliberately not a second
 * pipeline: every tenant-scoped write already flows through the audit hook
 * (see core-security's installAuditHook) into an append-only, per-tenant
 * event stream — that *is* the event ingestion layer the master plan calls
 * for. This module is the aggregation layer on top of it: the queries a
 * dashboard needs (activity trend, top actions) without every module having
 * to duplicate that data into a second "analytics_events" collection.
 */

export interface ActivityTrendPoint {
  date: string;
  count: number;
}

export interface ActionCount {
  action: string;
  count: number;
}

export interface ActivitySummary {
  totalEvents: number;
  trend: ActivityTrendPoint[];
  topActions: ActionCount[];
}

const DEFAULT_WINDOW_DAYS = 30;

export async function getActivityTrend(
  days = DEFAULT_WINDOW_DAYS,
): Promise<ActivityTrendPoint[]> {
  const repo = await getAuditLogRepository();
  return repo.countByDay(days);
}

export async function getTopActions(
  days = DEFAULT_WINDOW_DAYS,
  limit = 10,
): Promise<ActionCount[]> {
  const repo = await getAuditLogRepository();
  return repo.countByAction(days, limit);
}

export async function getActivitySummary(
  days = DEFAULT_WINDOW_DAYS,
): Promise<ActivitySummary> {
  const [trend, topActions] = await Promise.all([
    getActivityTrend(days),
    getTopActions(days),
  ]);
  const totalEvents = trend.reduce((sum, point) => sum + point.count, 0);
  return { totalEvents, trend, topActions };
}
