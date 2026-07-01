import { NextResponse } from "next/server";
import {
  getSsoConfigForTenant,
  handleSamlCallback,
  provisionSsoUser,
  issueSsoTicket,
} from "@atithira/core-identity";
import { ensureBootstrapped } from "@/lib/bootstrap";

/**
 * The SAML ACS (Assertion Consumer Service) endpoint the IdP POSTs to.
 * RelayState carries the tenantId as a routing hint (see
 * sso-service.ts's buildSamlAuthorizeUrl) — the IdP's signature on the
 * assertion is what actually proves authenticity, not RelayState itself.
 */
export async function POST(req: Request) {
  await ensureBootstrapped();

  const form = await req.formData();
  const samlResponse = form.get("SAMLResponse");
  const relayState = form.get("RelayState");
  if (typeof samlResponse !== "string" || typeof relayState !== "string") {
    return NextResponse.redirect(new URL("/login?error=sso_failed", req.url));
  }

  const tenantId = relayState;

  try {
    const config = await getSsoConfigForTenant(tenantId);
    if (!config) throw new Error("SSO config no longer exists for this tenant");

    const origin = new URL(req.url).origin;
    const callbackUrl = `${origin}/api/auth/sso/saml/callback`;
    const { email, name } = await handleSamlCallback(config, callbackUrl, {
      SAMLResponse: samlResponse,
      RelayState: relayState,
    });

    const { userId } = await provisionSsoUser(tenantId, email, name);
    const ticket = await issueSsoTicket(userId, tenantId);

    return NextResponse.redirect(new URL(`/sso/consume?ticket=${ticket}`, req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=sso_failed", req.url));
  }
}
