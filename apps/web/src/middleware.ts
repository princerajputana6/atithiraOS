import { NextResponse, type NextRequest } from "next/server";

// Edge-runtime, cheap cookie-presence gate only — no DB/Node-only imports
// here (Auth.js's Credentials + MongoDB adapter config can't run on the
// edge). Real authorization happens in requirePermission() / auth() inside
// route handlers and server components, which run on the Node runtime.
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

// Hostnames that mean "the app itself", never a tenant subdomain — so
// visiting the app at these hosts falls through to normal routing instead of
// being rewritten to a tenant's public site.
const RESERVED_SUBDOMAINS = new Set(["www", "app"]);

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

/**
 * If ROOT_DOMAIN is configured and the request host is "{slug}.ROOT_DOMAIN",
 * this is a tenant's published site, not the main app — rewrite to the
 * existing /site/{slug} renderer. Returns null when the host isn't a tenant
 * subdomain (main app domain, apex domain, or any host during local dev
 * without ROOT_DOMAIN set), so the caller falls through to normal routing.
 */
function resolveTenantSiteRewrite(req: NextRequest): URL | null {
  if (!ROOT_DOMAIN) return null;
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  if (!host.endsWith(`.${ROOT_DOMAIN}`)) return null;

  const subdomain = host.slice(0, -(`.${ROOT_DOMAIN}`.length));
  if (!subdomain || subdomain.includes(".") || RESERVED_SUBDOMAINS.has(subdomain)) {
    return null;
  }

  const url = req.nextUrl.clone();
  const suffix = url.pathname === "/" ? "" : url.pathname;
  url.pathname = `/site/${subdomain}${suffix}`;
  return url;
}

export function middleware(req: NextRequest) {
  const tenantSiteUrl = resolveTenantSiteRewrite(req);
  if (tenantSiteUrl) {
    return NextResponse.rewrite(tenantSiteUrl);
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix),
  );
  if (!isProtected) return NextResponse.next();

  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
    req.cookies.has(name),
  );
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
