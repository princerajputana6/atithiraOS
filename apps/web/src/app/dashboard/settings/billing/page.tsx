import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import { getActiveTenantIdForUser } from "@atithira/core-tenancy";
import {
  getActivePlan,
  getPlanRepository,
  isRazorpayConfigured,
} from "@atithira/core-billing";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { PageHeader, Card, CardBody, Badge } from "@/components/ui";
import { UpgradeButton } from "@/components/billing/upgrade-button";

export default async function BillingSettingsPage() {
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  const [plan, allPlans] = await Promise.all([
    runWithTenantContext({ tenantId, userId: session.user.id }, async () =>
      getActivePlan(),
    ),
    getPlanRepository().then((repo) => repo.list()),
  ]);
  const configured = isRazorpayConfigured();

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Your subscription plan and usage."
      />
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Current plan
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {plan?.name ?? "—"}
              </p>
            </div>
            <Badge tone="purple">
              {plan ? `₹${plan.priceMonthly}/mo` : "—"}
            </Badge>
          </div>
          {!configured && (
            <p className="mt-4 text-sm text-slate-500">
              Payment gateway is not configured for this deployment — set
              RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET to enable upgrades.
            </p>
          )}
        </CardBody>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {allPlans.map((p) => (
          <Card key={p.key}>
            <CardBody className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {p.name}
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {p.priceMonthly > 0 ? `₹${p.priceMonthly}/mo` : "Free"}
                </p>
              </div>
              {p.key === plan?.key ? (
                <Badge tone="green">Current plan</Badge>
              ) : p.priceMonthly > 0 ? (
                <UpgradeButton
                  planKey={p.key}
                  planName={p.name}
                  configured={configured}
                />
              ) : null}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
