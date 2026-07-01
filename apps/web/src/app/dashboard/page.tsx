import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import { getActiveTenantIdForUser, getOrganizationRepository } from "@atithira/core-tenancy";
import { getActivePlan } from "@atithira/core-billing";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";

export default async function DashboardPage() {
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  const { organization, plan } = await runWithTenantContext(
    { tenantId, userId: session.user.id },
    async () => {
      const orgRepo = await getOrganizationRepository();
      const organization = await orgRepo.findById(tenantId);
      const plan = await getActivePlan();
      return { organization, plan };
    },
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{organization?.name}</h1>
        <p className="text-sm text-gray-600">
          Status: {organization?.status} · Plan: {plan?.name ?? "—"}
        </p>
      </div>
      <p className="text-sm text-gray-600">Signed in as {session.user.email}</p>
    </div>
  );
}
