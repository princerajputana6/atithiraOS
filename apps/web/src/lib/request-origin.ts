import { headers } from "next/headers";
import { getEnv } from "@atithira/config";

/**
 * The public origin of the current request (e.g. https://atithira.vercel.app),
 * taken from the proxy-forwarded host so it's always the real deployed domain —
 * never a hard-coded localhost. Falls back to NEXT_PUBLIC_APP_URL only when no
 * host header is present (e.g. some build-time contexts).
 */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return getEnv().NEXT_PUBLIC_APP_URL;
}
