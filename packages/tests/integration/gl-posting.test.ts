import { describe, it, expect } from "vitest";
import { signup } from "@atithira/core-identity";
import { createOrganizationForNewUser } from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import {
  createInvoice,
  payInvoice,
  createExpense,
  decideExpense,
  getTrialBalance,
} from "@atithira/module-finance";

/**
 * Every invoice/payment/expense posting must land as a balanced double-entry
 * journal entry — an unbalanced GL silently corrupts every financial report
 * built on top of it, so this is the GL's equivalent of the cross-tenant
 * isolation gate: assert the invariant directly rather than trust it holds.
 */
describe("general ledger posting", () => {
  it("keeps the trial balance in balance across invoice, payment, and expense postings", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = await signup({
      email: `gl-owner-${suffix}@example.com`,
      password: "Sup3rSecret!23",
      name: "GL Owner",
    });
    const org = await createOrganizationForNewUser({
      organizationName: "GL Test Org",
      slug: `gl-test-${suffix}`,
      ownerUserId: user._id,
      ownerEmail: user.email,
    });

    await runWithTenantContext(
      { tenantId: org._id, userId: user._id },
      async () => {
        const invoice = await createInvoice({
          customerName: "Acme Co",
          amount: 1000,
          taxRate: 18,
        });
        await payInvoice(invoice._id);

        const expense = await createExpense({
          description: "Office supplies",
          category: "Supplies",
          amount: 250,
        });
        await decideExpense(expense._id, true);

        const trialBalance = await getTrialBalance();
        const totalDebit = trialBalance.reduce((sum, r) => sum + r.debit, 0);
        const totalCredit = trialBalance.reduce((sum, r) => sum + r.credit, 0);
        expect(totalDebit).toBe(totalCredit);

        const byCode = Object.fromEntries(trialBalance.map((r) => [r.accountCode, r]));
        // Invoice (Dr AR 1180 / Cr Revenue 1000 / Cr GST 180), then payment
        // (Dr Cash 1180 / Cr AR 1180) nets Accounts Receivable back to zero.
        expect(byCode["1000"].debit - byCode["1000"].credit).toBe(0);
        expect(byCode["1100"].debit).toBe(1180);
        expect(byCode["4000"].credit).toBe(1000);
        expect(byCode["2100"].credit).toBe(180);
        // Expense approval: Dr Operating Expenses 250 / Cr Accounts Payable 250.
        expect(byCode["5000"].debit).toBe(250);
        expect(byCode["2000"].credit).toBe(250);
      },
    );
  });
});
