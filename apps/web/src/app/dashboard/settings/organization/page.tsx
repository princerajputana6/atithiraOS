import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import {
  getActiveTenantIdForUser,
  getOrganizationRepository,
  getTenantConfigRepository,
} from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { PageHeader, Card, CardBody } from "@/components/ui";

export default async function OrganizationSettingsPage() {
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  const { org, config } = await runWithTenantContext(
    { tenantId, userId: session.user.id },
    async () => {
      const orgRepo = await getOrganizationRepository();
      const configRepo = await getTenantConfigRepository();
      return {
        org: await orgRepo.findById(tenantId),
        config: await configRepo.getForTenant(),
      };
    },
  );

  const rows = [
    { label: "Organization name", value: org?.name },
    { label: "Workspace slug", value: org?.slug },
    { label: "Status", value: org?.status },
    { label: "Locale", value: config?.locale },
    { label: "Currency", value: config?.currency },
    { label: "Timezone", value: config?.timezone },
  ];

  return (
    <div>
      <PageHeader
        title="Organization"
        description="Your workspace details and defaults."
      />
      <Card>
        <CardBody className="p-0">
          <dl className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <dt className="text-sm text-slate-500">{row.label}</dt>
                <dd className="text-sm font-medium capitalize text-slate-800">
                  {row.value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
