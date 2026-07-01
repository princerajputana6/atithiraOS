import { NextResponse, type NextRequest } from "next/server";

// Edge-runtime, cheap cookie-presence gate only — no DB/Node-only imports
// here (Auth.js's Credentials + MongoDB adapter config can't run on the
// edge). Real authorization happens in requirePermission() / auth() inside
// route handlers and server components, which run on the Node runtime.
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

const PROTECTED_PREFIXES = ["/dashboard"];

export function middleware(req: NextRequest) {
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
  matcher: ["/dashboard/:path*"],
};
