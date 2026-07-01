import { inngest } from "@atithira/core-events";
import { runWithTenantContext } from "@atithira/db";
import { getOrganizationRepository } from "@atithira/core-tenancy";
import { getNotificationRepository } from "@atithira/core-workflow";
import { getReport } from "./registry";

/**
 * Proves the "scheduled" half of the Reporting Service end-to-end: every
 * Monday at 08:00, re-runs the finance "trial-balance" report for every
 * tenant and drops the summary into that tenant's existing in-app
 * notification feed — no new delivery channel needed, since Notifications
 * already renders in the dashboard for every tenant.
 */
export const weeklyTrialBalanceReport = inngest.createFunction(
  { id: "weekly-trial-balance-report" },
  { cron: "0 8 * * 1" },
  async ({ step }) => {
    const report = getReport("trial-balance");
    if (!report) return; // module-finance not loaded in this deployment

    const orgRepo = await getOrganizationRepository();
    const orgs = await orgRepo.listAll();

    await step.run("post-tenant-summaries", async () => {
      await Promise.all(
        orgs.map((org) =>
          runWithTenantContext({ tenantId: org._id, userId: null }, async () => {
            const rows = await report.run({});
            const totalDebit = rows.reduce((sum, r) => sum + Number(r.debit ?? 0), 0);
            const totalCredit = rows.reduce((sum, r) => sum + Number(r.credit ?? 0), 0);
            const notificationRepo = await getNotificationRepository();
            await notificationRepo.insertOne(
              {
                message: `Weekly trial balance: ₹${totalDebit.toLocaleString("en-IN")} debit / ₹${totalCredit.toLocaleString("en-IN")} credit`,
                read: false,
                source: "scheduled-report",
                createdAt: new Date(),
              } as never,
              { skipAudit: true },
            );
          }),
        ),
      );
    });
  },
);
