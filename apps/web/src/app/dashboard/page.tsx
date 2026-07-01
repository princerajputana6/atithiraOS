import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import {
  getActiveTenantIdForUser,
  getOrganizationRepository,
  getMembershipRepository,
} from "@atithira/core-tenancy";
import { getActivePlan } from "@atithira/core-billing";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { Card, CardBody, PageHeader, Badge } from "@/components/ui";

const QUICK_LINKS = [
  { label: "Add a contact", href: "/dashboard/crm/contacts", tone: "In CRM" },
  { label: "Capture a lead", href: "/dashboard/crm/leads", tone: "In CRM" },
  { label: "Open the pipeline", href: "/dashboard/crm/deals", tone: "In CRM" },
  { label: "Invite a teammate", href: "/dashboard/members", tone: "Settings" },
];

export default async function DashboardPage() {
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  const { organization, plan, memberCount } = await runWithTenantContext(
    { tenantId, userId: session.user.id },
    async () => {
      const orgRepo = await getOrganizationRepository();
      const membershipRepo = await getMembershipRepository();
      const organization = await orgRepo.findById(tenantId);
      const plan = await getActivePlan();
      const members = await membershipRepo.listMembers();
      return { organization, plan, memberCount: members.length };
    },
  );

  return (
    <div>
      <PageHeader
        title={`Welcome back`}
        description={`Here's what's happening at ${organization?.name ?? "your workspace"}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Workspace status">
          <Badge tone={organization?.status === "active" ? "green" : "blue"}>
            {organization?.status ?? "—"}
          </Badge>
        </Stat>
        <Stat label="Plan">
          <span className="text-2xl font-semibold text-slate-900">
            {plan?.name ?? "—"}
          </span>
        </Stat>
        <Stat label="Team members">
          <span className="text-2xl font-semibold text-slate-900">
            {memberCount}
          </span>
        </Stat>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-slate-700">
        Quick actions
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition hover:shadow-card-hover">
              <CardBody>
                <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                  {link.tone}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {link.label}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className="mt-2">{children}</div>
      </CardBody>
    </Card>
  );
}
