import * as client from "openid-client";
import { SAML } from "@node-saml/node-saml";
import { runWithTenantContext } from "@atithira/db";
import { getMembershipRepository } from "@atithira/core-tenancy";
import { getRoleRepository, assignRole } from "@atithira/core-security";
import type { Membership, SsoConfig, SsoProtocol } from "@atithira/types";
import { getUserRepository, getSsoConfigRepository, getSsoTicketRepository } from "../collections";
import { encryptSecret, decryptSecret } from "../mfa/encryption";

function emailDomain(email: string): string {
  return email.toLowerCase().split("@")[1] ?? "";
}

export async function resolveSsoConfigByEmail(email: string): Promise<SsoConfig | null> {
  const domain = emailDomain(email);
  if (!domain) return null;
  const repo = await getSsoConfigRepository();
  return repo.findEnabledByEmailDomain(domain);
}

export async function getSsoConfigForTenant(tenantId: string): Promise<SsoConfig | null> {
  const repo = await getSsoConfigRepository();
  return repo.findByTenantId(tenantId);
}

export interface UpsertSsoConfigInput {
  protocol: SsoProtocol;
  enabled: boolean;
  emailDomains: string[];
  oidcIssuer?: string;
  oidcClientId?: string;
  oidcClientSecret?: string; // plaintext in, encrypted before storage
  samlEntryPoint?: string;
  samlIssuer?: string;
  samlCert?: string;
}

/** Call inside runWithTenantContext for the tenant configuring SSO (admin settings only). */
export async function upsertSsoConfig(
  tenantId: string,
  input: UpsertSsoConfigInput,
): Promise<void> {
  const repo = await getSsoConfigRepository();
  const existing = await repo.findByTenantId(tenantId);

  await repo.upsertForTenant(tenantId, {
    protocol: input.protocol,
    enabled: input.enabled,
    emailDomains: input.emailDomains.map((d) => d.toLowerCase()),
    oidcIssuer: input.oidcIssuer,
    oidcClientId: input.oidcClientId,
    // Keep the existing secret if the admin didn't resubmit one (settings
    // forms never round-trip the decrypted secret back to the browser).
    oidcClientSecretEncrypted: input.oidcClientSecret
      ? encryptSecret(input.oidcClientSecret)
      : existing?.oidcClientSecretEncrypted,
    samlEntryPoint: input.samlEntryPoint,
    samlIssuer: input.samlIssuer,
    samlCert: input.samlCert,
  });
}

/** Never returns the decrypted client secret — the settings UI shows only whether one is set. */
export function toPublicSsoConfig(config: SsoConfig) {
  return {
    protocol: config.protocol,
    enabled: config.enabled,
    emailDomains: config.emailDomains,
    oidcIssuer: config.oidcIssuer,
    oidcClientId: config.oidcClientId,
    oidcClientSecretSet: !!config.oidcClientSecretEncrypted,
    samlEntryPoint: config.samlEntryPoint,
    samlIssuer: config.samlIssuer,
    samlCert: config.samlCert,
  };
}

/* --------------------------------- OIDC -------------------------------- */

export async function discoverOidcClient(config: SsoConfig): Promise<client.Configuration> {
  if (!config.oidcIssuer || !config.oidcClientId || !config.oidcClientSecretEncrypted) {
    throw new Error("OIDC is not fully configured for this tenant");
  }
  const clientSecret = decryptSecret(config.oidcClientSecretEncrypted);
  return client.discovery(new URL(config.oidcIssuer), config.oidcClientId, clientSecret);
}

export interface OidcFlowState {
  tenantId: string;
  state: string;
  nonce: string;
  codeVerifier: string;
}

export async function buildOidcAuthorizationUrl(
  config: SsoConfig,
  tenantId: string,
  redirectUri: string,
): Promise<{ url: string; flowState: OidcFlowState }> {
  const oidcClient = await discoverOidcClient(config);
  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  const nonce = client.randomNonce();

  const url = client.buildAuthorizationUrl(oidcClient, {
    redirect_uri: redirectUri,
    scope: "openid email profile",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    nonce,
  });

  return { url: url.href, flowState: { tenantId, state, nonce, codeVerifier } };
}

export const OIDC_FLOW_COOKIE_NAME = "atithira_oidc_flow";

/** Round-trips OidcFlowState through the callback redirect via an encrypted cookie — apps/web never touches the raw AES key or JSON shape directly. */
export function encryptOidcFlowState(flowState: OidcFlowState): string {
  return encryptSecret(JSON.stringify(flowState));
}

export function decryptOidcFlowState(payload: string): OidcFlowState {
  return JSON.parse(decryptSecret(payload)) as OidcFlowState;
}

export async function handleOidcCallback(
  config: SsoConfig,
  currentUrl: URL,
  flowState: OidcFlowState,
): Promise<{ email: string; name?: string }> {
  const oidcClient = await discoverOidcClient(config);
  const tokens = await client.authorizationCodeGrant(oidcClient, currentUrl, {
    expectedState: flowState.state,
    expectedNonce: flowState.nonce,
    pkceCodeVerifier: flowState.codeVerifier,
  });
  const claims = tokens.claims();
  const email = claims?.email as string | undefined;
  if (!email) throw new Error("IdP did not return an email claim");
  return { email, name: claims?.name as string | undefined };
}

/* --------------------------------- SAML -------------------------------- */

function buildSamlClient(config: SsoConfig, callbackUrl: string): SAML {
  if (!config.samlEntryPoint || !config.samlIssuer || !config.samlCert) {
    throw new Error("SAML is not fully configured for this tenant");
  }
  return new SAML({
    entryPoint: config.samlEntryPoint,
    idpCert: config.samlCert,
    // Our SP entity ID (what the IdP identifies us as) — reuse the ACS URL,
    // the common convention when no separate metadata document is published.
    issuer: callbackUrl,
    callbackUrl,
    wantAssertionsSigned: true,
  });
}

/** RelayState carries the tenantId so the shared ACS endpoint knows which tenant's IdP cert to validate against — the signature check is what actually proves authenticity, not the RelayState value. */
export async function buildSamlAuthorizeUrl(
  config: SsoConfig,
  tenantId: string,
  callbackUrl: string,
): Promise<string> {
  const saml = buildSamlClient(config, callbackUrl);
  return saml.getAuthorizeUrlAsync(tenantId, undefined, {});
}

export async function handleSamlCallback(
  config: SsoConfig,
  callbackUrl: string,
  body: Record<string, string>,
): Promise<{ email: string; name?: string }> {
  const saml = buildSamlClient(config, callbackUrl);
  const { profile } = await saml.validatePostResponseAsync(body);
  const email = profile?.email ?? profile?.mail ?? profile?.nameID;
  if (!email) throw new Error("IdP response did not include an email or NameID");
  return { email, name: undefined };
}

/**
 * Just-in-time provisioning: finds or creates the user's global identity,
 * then ensures they hold membership in the SSO-authenticating tenant
 * (auto-assigned the "employee" role on first login — an admin can upgrade
 * their role afterward same as any invited member).
 */
export async function provisionSsoUser(
  tenantId: string,
  email: string,
  name: string | undefined,
): Promise<{ userId: string; isNewUser: boolean }> {
  const userRepo = await getUserRepository();
  const existing = await userRepo.findByEmail(email);

  const userId = existing
    ? existing._id
    : (
        await userRepo.create({
          email: email.toLowerCase(),
          // SSO proves control of the account via the IdP — no separate verification step needed.
          emailVerified: new Date(),
          name,
          mfaEnabled: false,
          mfaSecret: null,
          mfaRecoveryCodesHash: [],
          sessionVersion: 0,
          status: "active",
        } as Parameters<typeof userRepo.create>[0])
      )._id;

  await runWithTenantContext({ tenantId, userId }, async () => {
    const membershipRepo = await getMembershipRepository();
    const membership = await membershipRepo.findForUser(userId);
    if (membership) return;

    const roleRepo = await getRoleRepository();
    const employeeRole = await roleRepo.findByKey("employee");
    if (!employeeRole) throw new Error("Default employee role not seeded for this tenant");

    await membershipRepo.insertOne(
      {
        userId,
        status: "active",
        joinedAt: new Date(),
        createdAt: new Date(),
      } as Omit<Membership, "_id" | "tenantId">,
      { action: "membership.created" },
    );
    await assignRole(userId, employeeRole._id, { level: "org" });
  });

  return { userId, isNewUser: !existing };
}

export async function issueSsoTicket(userId: string, tenantId: string): Promise<string> {
  const repo = await getSsoTicketRepository();
  return repo.issue(userId, tenantId);
}

export async function consumeSsoTicket(
  ticketId: string,
): Promise<{ userId: string; tenantId: string } | null> {
  const repo = await getSsoTicketRepository();
  const ticket = await repo.consume(ticketId);
  return ticket ? { userId: ticket.userId, tenantId: ticket.tenantId } : null;
}
