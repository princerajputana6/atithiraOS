import { PERMISSIONS } from "@atithira/core-security";
import {
  getSsoConfigForTenant,
  upsertSsoConfig,
  toPublicSsoConfig,
} from "@atithira/core-identity";
import { tenantApi } from "@/lib/api";

export async function GET() {
  return tenantApi(PERMISSIONS.SECURITY_SSO_MANAGE, async (ctx) => {
    const config = await getSsoConfigForTenant(ctx.tenantId);
    return { config: config ? toPublicSsoConfig(config) : null };
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApi(PERMISSIONS.SECURITY_SSO_MANAGE, async (ctx) => {
    if (body.protocol !== "oidc" && body.protocol !== "saml") {
      throw new Error("protocol must be oidc or saml");
    }
    if (!Array.isArray(body.emailDomains) || body.emailDomains.length === 0) {
      throw new Error("At least one email domain is required");
    }
    await upsertSsoConfig(ctx.tenantId, {
      protocol: body.protocol,
      enabled: !!body.enabled,
      emailDomains: body.emailDomains,
      oidcIssuer: body.oidcIssuer || undefined,
      oidcClientId: body.oidcClientId || undefined,
      oidcClientSecret: body.oidcClientSecret || undefined,
      samlEntryPoint: body.samlEntryPoint || undefined,
      samlIssuer: body.samlIssuer || undefined,
      samlCert: body.samlCert || undefined,
    });
    return { ok: true };
  });
}
