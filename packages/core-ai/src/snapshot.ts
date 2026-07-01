import { getDb, getTenantContext } from "@atithira/db";

/**
 * Read-only aggregate view of a tenant's data across every module, assembled
 * for the Copilot to reason over. This is the "unified data layer" advantage:
 * one snapshot spans CRM, Finance, People, Inventory, and Projects. Strictly
 * tenant-scoped — every query filters by the active tenantId.
 */
export async function buildTenantSnapshot(): Promise<Record<string, unknown>> {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");
  const tenantId = ctx.tenantId;
  const db = await getDb();

  const count = (coll: string, extra: Record<string, unknown> = {}) =>
    db.collection(coll).countDocuments({ tenantId, ...extra });

  const [
    contacts,
    leads,
    dealsWon,
    dealsOpen,
    invoicesPaid,
    invoicesUnpaid,
    expensesPending,
    employees,
    products,
    lowStock,
    projects,
    openTasks,
  ] = await Promise.all([
    count("crm_contacts"),
    count("crm_leads"),
    count("crm_deals", { stage: "won" }),
    count("crm_deals", { stage: { $in: ["qualified", "proposal", "negotiation"] } }),
    count("finance_invoices", { status: "paid" }),
    count("finance_invoices", { status: { $in: ["draft", "sent"] } }),
    count("finance_expenses", { status: "pending" }),
    count("people_employees", { status: "active" }),
    count("inventory_products"),
    countLowStock(db, tenantId),
    count("projects_projects"),
    count("projects_tasks", { status: { $in: ["todo", "in_progress"] } }),
  ]);

  const revenue = await sumPaidRevenue(db, tenantId);

  return {
    crm: { contacts, leads, dealsWon, dealsOpen },
    finance: { invoicesPaid, invoicesUnpaid, expensesPending, revenueFromPaidInvoices: revenue },
    people: { activeEmployees: employees },
    inventory: { products, lowStockProducts: lowStock },
    projects: { projects, openTasks },
  };
}

async function sumPaidRevenue(
  db: Awaited<ReturnType<typeof getDb>>,
  tenantId: string,
): Promise<number> {
  const result = await db
    .collection("finance_invoices")
    .aggregate([
      { $match: { tenantId, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])
    .toArray();
  return (result[0]?.total as number | undefined) ?? 0;
}

async function countLowStock(
  db: Awaited<ReturnType<typeof getDb>>,
  tenantId: string,
): Promise<number> {
  return db.collection("inventory_products").countDocuments({
    tenantId,
    $expr: { $lte: ["$stockQty", "$reorderLevel"] },
  });
}
