import { NextResponse } from "next/server";
import {
  resolveSsoConfigByEmail,
  buildOidcAuthorizationUrl,
  buildSamlAuthorizeUrl,
  encryptOidcFlowState,
  OIDC_FLOW_COOKIE_NAME,
} from "@atithira/core-identity";
import { ensureBootstrapped } from "@/lib/bootstrap";

/**
 * Entry point for SSO login: given the email the user typed on /login,
 * resolves which tenant's IdP owns that email domain and redirects there.
 * No session exists yet — that's the whole point of this route.
 */
export async function GET(req: Request) {
  await ensureBootstrapped();
  const email = new URL(req.url).searchParams.get("email")?.trim();
  if (!email) {
    return NextResponse.redirect(new URL("/login?error=sso_email_required", req.url));
  }

  const config = await resolveSsoConfigByEmail(email);
  if (!config) {
    return NextResponse.redirect(new URL("/login?error=sso_not_configured", req.url));
  }

  const origin = new URL(req.url).origin;

  if (config.protocol === "oidc") {
    const redirectUri = `${origin}/api/auth/sso/oidc/callback`;
    const { url, flowState } = await buildOidcAuthorizationUrl(
      config,
      config.tenantId,
      redirectUri,
    );
    const res = NextResponse.redirect(url);
    res.cookies.set(OIDC_FLOW_COOKIE_NAME, encryptOidcFlowState(flowState), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });
    return res;
  }

  const callbackUrl = `${origin}/api/auth/sso/saml/callback`;
  const url = await buildSamlAuthorizeUrl(config, config.tenantId, callbackUrl);
  return NextResponse.redirect(url);
}
