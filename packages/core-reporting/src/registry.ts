export interface ReportDefinition {
  key: string;
  name: string;
  description: string;
  /** Runs inside the caller's tenant context — same convention as every other tenant-scoped service in this codebase. */
  run: (params: Record<string, string>) => Promise<Record<string, unknown>[]>;
}

/**
 * The Reporting Service's registry. Each module registers its own reports at
 * import time (see module-finance/src/reports.ts for the pattern) — kernel
 * code never depends on a module, so this stays a dumb Map that modules
 * populate, not a place that imports module logic directly.
 */
const reports = new Map<string, ReportDefinition>();

export function registerReport(def: ReportDefinition): void {
  reports.set(def.key, def);
}

export function getReport(key: string): ReportDefinition | undefined {
  return reports.get(key);
}

export function listReports(): Omit<ReportDefinition, "run">[] {
  return [...reports.values()].map(({ key, name, description }) => ({
    key,
    name,
    description,
  }));
}
