import { NextResponse } from "next/server";
import { resolveActor, can } from "@atithira/core-security";
import { runWithTenantContext } from "@atithira/db";
import { getLeadRepository, getContactRepository } from "@atithira/module-crm";
import { getInvoiceRepository } from "@atithira/module-finance";
import { getProductRepository } from "@atithira/module-inventory";
import { getEmployeeRepository } from "@atithira/module-people";
import { getTaskRepository } from "@atithira/module-projects";
import { ensureBootstrapped } from "@/lib/bootstrap";

interface SearchSource {
  type: string;
  permission: string;
  getRepo: () => Promise<{ search: (query: string) => Promise<{ _id: string }[]> }>;
  label: (doc: Record<string, unknown>) => string;
}

const SOURCES: SearchSource[] = [
  { type: "lead", permission: "crm.lead.read", getRepo: getLeadRepository, label: (d) => String(d.name) },
  { type: "contact", permission: "crm.contact.read", getRepo: getContactRepository, label: (d) => String(d.name) },
  { type: "invoice", permission: "finance.invoice.read", getRepo: getInvoiceRepository, label: (d) => String(d.number) },
  { type: "product", permission: "inventory.product.read", getRepo: getProductRepository, label: (d) => String(d.name) },
  { type: "employee", permission: "people.employee.read", getRepo: getEmployeeRepository, label: (d) => String(d.name) },
  { type: "task", permission: "projects.task.read", getRepo: getTaskRepository, label: (d) => String(d.title) },
];

/**
 * Cross-module search, composed at the app layer (not in a core package —
 * the kernel must never depend on a module, per the architectural
 * principle in default-roles.ts). Each result type is gated by that
 * module's own read permission, so a caller only sees what they could
 * already see by browsing that module directly.
 */
export async function GET(req: Request) {
  await ensureBootstrapped();
  const query = new URL(req.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ results: [] });

  const actor = await resolveActor();
  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runWithTenantContext({ tenantId: actor.tenantId, userId: actor.userId }, async () => {
    const results = await Promise.all(
      SOURCES.map(async (source) => {
        if (!(await can(actor.userId, source.permission))) return [];
        const repo = await source.getRepo();
        const docs = await repo.search(query);
        return docs.map((doc) => ({
          type: source.type,
          id: String(doc._id),
          label: source.label(doc as unknown as Record<string, unknown>),
        }));
      }),
    );
    return NextResponse.json({ results: results.flat() });
  });
}
