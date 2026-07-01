import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getSsoConfigForTenant,
  decryptOidcFlowState,
  handleOidcCallback,
  provisionSsoUser,
  issueSsoTicket,
  OIDC_FLOW_COOKIE_NAME,
} from "@atithira/core-identity";
import { ensureBootstrapped } from "@/lib/bootstrap";

export async function GET(req: Request) {
  await ensureBootstrapped();

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(OIDC_FLOW_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return NextResponse.redirect(new URL("/login?error=sso_expired", req.url));
  }

  try {
    const flowState = decryptOidcFlowState(cookieValue);
    const config = await getSsoConfigForTenant(flowState.tenantId);
    if (!config) throw new Error("SSO config no longer exists for this tenant");

    const { email, name } = await handleOidcCallback(config, new URL(req.url), flowState);
    const { userId } = await provisionSsoUser(flowState.tenantId, email, name);
    const ticket = await issueSsoTicket(userId, flowState.tenantId);

    const res = NextResponse.redirect(new URL(`/sso/consume?ticket=${ticket}`, req.url));
    res.cookies.delete(OIDC_FLOW_COOKIE_NAME);
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=sso_failed", req.url));
  }
}
