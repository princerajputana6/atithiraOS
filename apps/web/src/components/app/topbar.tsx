import Link from "next/link";
import { SearchBox } from "@/components/app/search-box";
import { BrandLogoBadge } from "@/components/brand-logo";

export function Topbar({
  orgName,
  userEmail,
}: {
  orgName: string;
  userEmail: string;
}) {
  const initial = (userEmail?.[0] ?? "?").toUpperCase();
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-blue-100 bg-white px-6 shadow-card">
      <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700">
        <BrandLogoBadge
          className="hidden items-center rounded-lg bg-brand-700 px-2.5 py-1.5 shadow-sm max-lg:inline-flex"
          logoClassName="h-5 w-auto max-w-[6rem] object-contain"
        />
        <span className="hidden lg:inline">{orgName}</span>
      </div>
      <SearchBox />
      <div className="flex shrink-0 items-center gap-4">
        <span className="hidden text-sm text-slate-500 sm:inline">
          {userEmail}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white shadow-sm">
          {initial}
        </div>
        <Link
          href="/api/auth/signout"
          className="rounded-lg border border-blue-100 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-blue-50"
        >
          Sign out
        </Link>
      </div>
    </header>
  );
}
