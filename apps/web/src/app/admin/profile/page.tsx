import Link from "next/link";
import { redirect } from "next/navigation";
import { resolvePlatformOwner } from "@/lib/admin";
import { Card } from "@/components/card";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function AdminProfilePage() {
  const owner = await resolvePlatformOwner();
  if (!owner) redirect("/login");

  return (
    <div>
      <AdminPageHeader title="Profile" description="Your Platform Owner account." />
      <Card>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
            {(owner.email[0] ?? "A").toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-950">{owner.email}</p>
            <p className="text-sm text-slate-600">Platform Owner · Atithira staff</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-blue-100 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-700">{owner.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Scope</dt>
            <dd className="mt-1 text-sm text-slate-700">Global — all tenants</dd>
          </div>
        </dl>

        <div className="mt-6 flex gap-3">
          <Link
            href="/api/auth/signout"
            className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm transition hover:bg-blue-50"
          >
            Sign out
          </Link>
        </div>
      </Card>
    </div>
  );
}
