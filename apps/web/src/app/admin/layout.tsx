import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { resolvePlatformOwner } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) redirect("/login");

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-mesh-glow opacity-50" />

      <div className="relative z-10 flex min-h-screen w-full">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm font-medium text-slate-400">
                Atithira · Platform Admin
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-white/5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 to-indigo-400 text-xs font-bold text-slate-950">
                    {(owner.email[0] ?? "A").toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{owner.email}</span>
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 transition hover:bg-white/10"
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
