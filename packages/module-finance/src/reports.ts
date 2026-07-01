import { registerReport } from "@atithira/core-reporting";
import { getTrialBalance } from "./gl-service";
import { listInvoices } from "./services";

registerReport({
  key: "trial-balance",
  name: "Trial Balance",
  description: "Debit/credit totals for every GL account.",
  run: async () => {
    const rows = await getTrialBalance();
    return rows as unknown as Record<string, unknown>[];
  },
});

registerReport({
  key: "invoices-by-status",
  name: "Invoices by Status",
  description: "Every invoice with its current status and total.",
  run: async () => {
    const invoices = await listInvoices();
    return invoices.map((inv) => ({
      number: inv.number,
      customerName: inv.customerName,
      status: inv.status,
      total: inv.total,
      currency: inv.currency,
    }));
  },
});
