import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { resolvePlatformOwner } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { BrandLogoBadge } from "@/components/brand-logo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) redirect("/login");

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="relative flex min-h-screen w-full">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-blue-100 bg-white shadow-card">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <BrandLogoBadge
                  className="hidden items-center rounded-lg bg-brand-700 px-2.5 py-1.5 shadow-sm max-lg:inline-flex"
                  logoClassName="h-5 w-auto max-w-[6rem] object-contain"
                />
                <span className="hidden lg:inline">Platform Admin</span>
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-blue-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-sm">
                    {(owner.email[0] ?? "A").toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{owner.email}</span>
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="rounded-lg border border-blue-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-blue-50"
                >
                  Sign out
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
