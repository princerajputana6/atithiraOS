import Link from "next/link";
import { SearchBox } from "@/components/app/search-box";

export function Topbar({
  orgName,
  userEmail,
}: {
  orgName: string;
  userEmail: string;
}) {
  const initial = (userEmail?.[0] ?? "?").toUpperCase();
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <div className="hidden shrink-0 items-center gap-2 text-sm font-medium text-slate-700 sm:flex">
        {orgName}
      </div>
      <SearchBox />
      <div className="flex shrink-0 items-center gap-4">
        <span className="hidden text-sm text-slate-500 sm:inline">
          {userEmail}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {initial}
        </div>
        <Link
          href="/api/auth/signout"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
        >
          Sign out
        </Link>
      </div>
    </header>
  );
}
