"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { NAV_GROUPS, SETTINGS_GROUP, type NavGroup } from "./nav-config";

/** Keeps only items the tenant is entitled to; drops a group if nothing remains. */
function filterGroups(
  groups: NavGroup[],
  enabledModules: Record<string, boolean>,
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.moduleKey || enabledModules[item.moduleKey],
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}

function Group({ group, pathname }: { group: NavGroup; pathname: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-blue-100/70">
        <Icon path={group.icon} />
        {group.label}
      </div>
      <div className="flex flex-col gap-0.5">
        {group.items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mx-2 rounded-lg px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-white/20 font-medium text-white shadow-sm"
                  : "text-blue-50/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar({
  enabledModules,
}: {
  enabledModules: Record<string, boolean>;
}) {
  const pathname = usePathname();
  const groups = filterGroups(NAV_GROUPS, enabledModules);
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar-gradient lg:flex">
      <Link
        href="/dashboard"
        className="flex items-center px-5 py-4"
        aria-label="Atithira dashboard"
      >
        <BrandLogo className="h-9 w-auto max-w-[9rem] object-contain" priority />
      </Link>

      <Link
        href="/dashboard"
        className={`mx-2 mb-1 rounded-lg px-3 py-1.5 text-sm transition ${
          pathname === "/dashboard"
            ? "bg-white/20 font-medium text-white shadow-sm"
            : "text-blue-50/75 hover:bg-white/10 hover:text-white"
        }`}
      >
        Home
      </Link>

      <nav className="flex-1 overflow-y-auto pb-6">
        {groups.map((group) => (
          <Group key={group.label} group={group} pathname={pathname} />
        ))}
        <Group group={SETTINGS_GROUP} pathname={pathname} />
      </nav>
    </aside>
  );
}
