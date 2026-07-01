import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import { getActiveTenantIdForUser } from "@atithira/core-tenancy";
import {
  listInvoices,
  listExpenses,
  getTrialBalance,
} from "@atithira/module-finance";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { PageHeader, Card, CardBody, Badge } from "@/components/ui";

const LINKS = [
  {
    href: "/dashboard/finance/invoices",
    title: "Invoices",
    desc: "Create invoices, apply GST, and record payments.",
  },
  {
    href: "/dashboard/finance/expenses",
    title: "Expenses",
    desc: "Submit expense claims and approve reimbursements.",
  },
  {
    href: "/dashboard/finance/gl",
    title: "General Ledger",
    desc: "Trial balance, posted automatically from invoices, payments, and expenses.",
  },
];

function money(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${n}`;
  }
}

export default async function FinancePage() {
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  const { collected, outstanding, expensesPending, balanced } =
    await runWithTenantContext(
      { tenantId, userId: session.user.id },
      async () => {
        const [invoices, expenses, trial] = await Promise.all([
          listInvoices(),
          listExpenses(),
          getTrialBalance(),
        ]);
        const collected = invoices
          .filter((i) => i.status === "paid")
          .reduce((s, i) => s + i.total, 0);
        const outstanding = invoices
          .filter((i) => i.status === "draft" || i.status === "sent")
          .reduce((s, i) => s + i.total, 0);
        const expensesPending = expenses.filter(
          (e) => e.status === "pending",
        ).length;
        const totalDebit = trial.reduce((s, r) => s + (r.debit ?? 0), 0);
        const totalCredit = trial.reduce((s, r) => s + (r.credit ?? 0), 0);
        return {
          collected,
          outstanding,
          expensesPending,
          balanced: Math.round(totalDebit) === Math.round(totalCredit),
        };
      },
    );

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Invoicing, payments, expenses, and India-first GST."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue collected" value={money(collected)} />
        <Stat label="Outstanding invoices" value={money(outstanding)} />
        <Stat label="Expenses pending" value={String(expensesPending)} />
        <Stat label="Ledger">
          <Badge tone={balanced ? "green" : "red"}>
            {balanced ? "In balance" : "Out of balance"}
          </Badge>
        </Stat>
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

function Stat({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className="mt-2 text-2xl font-semibold text-slate-900">
          {children ?? value}
        </div>
      </CardBody>
    </Card>
  );
}
