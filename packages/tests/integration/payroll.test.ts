import { describe, it, expect } from "vitest";
import { signup } from "@atithira/core-identity";
import { createOrganizationForNewUser } from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import {
  createEmployee,
  setSalaryStructure,
  generatePayslip,
} from "@atithira/module-people";

/**
 * Locks in the statutory-deduction formulas documented in payroll-service.ts
 * (PF: 12% of basic capped at a ₹15,000 basic; ESI: 0.75% of gross only when
 * gross is at/below the ₹21,000 ESI wage ceiling) so a future refactor can't
 * silently drift from EPFO's rule without a test failing.
 */
describe("payroll statutory deductions", () => {
  it("computes PF/ESI correctly with and without an explicit salary structure", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = await signup({
      email: `payroll-owner-${suffix}@example.com`,
      password: "Sup3rSecret!23",
      name: "Payroll Owner",
    });
    const org = await createOrganizationForNewUser({
      organizationName: "Payroll Test Org",
      slug: `payroll-test-${suffix}`,
      ownerUserId: user._id,
      ownerEmail: user.email,
    });

    await runWithTenantContext(
      { tenantId: org._id, userId: user._id },
      async () => {
        // No salary structure set — falls back to monthlySalary as basic,
        // below the ESI ceiling.
        const lowPaidEmployee = await createEmployee({
          name: "Low Paid",
          monthlySalary: 20_000,
        });
        const lowSlip = await generatePayslip(lowPaidEmployee._id, 6, 2026);
        expect(lowSlip.gross).toBe(20_000);
        expect(lowSlip.pf).toBe(1_800); // 15,000 (capped) * 12%
        expect(lowSlip.esi).toBe(150); // 20,000 * 0.75%, under the 21,000 ceiling
        expect(lowSlip.netPay).toBe(20_000 - 1_800 - 150);

        // Explicit structure pushing gross above the ESI ceiling — ESI drops
        // to zero entirely (it's a ceiling, not a cap like PF).
        const highPaidEmployee = await createEmployee({ name: "High Paid" });
        await setSalaryStructure({
          employeeId: highPaidEmployee._id,
          basic: 30_000,
          hra: 12_000,
          otherAllowances: 3_000,
        });
        const highSlip = await generatePayslip(highPaidEmployee._id, 6, 2026);
        expect(highSlip.gross).toBe(45_000);
        expect(highSlip.pf).toBe(1_800); // still capped at 15,000 basic
        expect(highSlip.esi).toBe(0); // 45,000 > 21,000 ceiling
        expect(highSlip.netPay).toBe(45_000 - 1_800);

        // Regenerating for the same employee/period must fail — payroll is
        // idempotent per period, not additive.
        await expect(generatePayslip(lowPaidEmployee._id, 6, 2026)).rejects.toThrow();
      },
    );
  });
});
