export type SsoProtocol = "oidc" | "saml";

/**
 * One per tenant. Not tenant-scoped in the usual sense: login-time lookup
 * happens by email domain, before any tenant context exists (same
 * deliberate exception as OrganizationRepository).
 */
export interface SsoConfig {
  _id: string;
  tenantId: string;
  protocol: SsoProtocol;
  enabled: boolean;
  /** Email domains routed to this tenant's IdP at login, e.g. ["acme.com"]. */
  emailDomains: string[];

  // OIDC
  oidcIssuer?: string;
  oidcClientId?: string;
  /** AES-256-GCM encrypted at rest via core-identity/mfa/encryption's key. */
  oidcClientSecretEncrypted?: string;

  // SAML
  /** IdP's SSO redirect endpoint. */
  samlEntryPoint?: string;
  /** IdP's entity ID. */
  samlIssuer?: string;
  /** IdP's public signing certificate (PEM) — not a secret, verifies the IdP's signature. */
  samlCert?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * A one-time, short-lived bridge between "the IdP confirmed this identity"
 * and "Auth.js issues a session" — consumed exactly once by the sso-ticket
 * Credentials provider (see auth-config.ts), then marked used so a captured
 * callback URL can't be replayed into a second session.
 */
export interface SsoTicket {
  _id: string;
  userId: string;
  tenantId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}
