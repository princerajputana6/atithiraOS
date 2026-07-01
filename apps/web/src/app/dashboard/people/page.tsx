import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import { getActiveTenantIdForUser } from "@atithira/core-tenancy";
import {
  listEmployees,
  listLeave,
  listPayslips,
} from "@atithira/module-people";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { PageHeader, Card, CardBody } from "@/components/ui";

const LINKS = [
  {
    href: "/dashboard/people/employees",
    title: "Employees",
    desc: "Employee records, job details, and departments.",
  },
  {
    href: "/dashboard/people/leave",
    title: "Leave",
    desc: "Request and approve time off.",
  },
  {
    href: "/dashboard/people/payroll",
    title: "Payroll",
    desc: "Generate payslips with India-first PF/ESI deductions.",
  },
];

export default async function PeoplePage() {
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  const { headcount, pendingLeave, payslips } = await runWithTenantContext(
    { tenantId, userId: session.user.id },
    async () => {
      const [employees, leave, slips] = await Promise.all([
        listEmployees(),
        listLeave(),
        listPayslips(),
      ]);
      return {
        headcount: employees.filter((e) => e.status === "active").length,
        pendingLeave: leave.filter((l) => l.status === "pending").length,
        payslips: slips.length,
      };
    },
  );

  return (
    <div>
      <PageHeader
        title="People"
        description="HRMS — employees, attendance, leave, and payroll."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Active headcount" value={String(headcount)} />
        <Stat label="Leave requests pending" value={String(pendingLeave)} />
        <Stat label="Payslips generated" value={String(payslips)} />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-700">Manage</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="transition hover:shadow-card-hover">
              <CardBody>
                <p className="text-base font-semibold text-slate-900">
                  {l.title}
                </p>
                <p className="mt-1 text-sm text-slate-500">{l.desc}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      </CardBody>
    </Card>
  );
}
