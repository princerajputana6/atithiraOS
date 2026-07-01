export { UserRepository } from "./repositories/user-repository";
export { InviteRepository } from "./repositories/invite-repository";
export { EmailVerificationTokenRepository } from "./repositories/email-verification-token-repository";
export { PasswordResetTokenRepository } from "./repositories/password-reset-token-repository";
export { SessionDenylistRepository } from "./repositories/session-denylist-repository";
export { SsoConfigRepository } from "./repositories/sso-config-repository";
export { SsoTicketRepository } from "./repositories/sso-ticket-repository";

export {
  getUserRepository,
  getInviteRepository,
  getEmailVerificationTokenRepository,
  getPasswordResetTokenRepository,
  getSessionDenylistRepository,
  getSsoConfigRepository,
  getSsoTicketRepository,
} from "./collections";

export { ensureIdentityIndexes } from "./ensure-indexes";

export { hashPassword, verifyPassword } from "./crypto/password";
export { generateToken, hashToken, generateRecoveryCodes } from "./crypto/tokens";

export { signup, type SignupInput } from "./services/signup-service";
export { verifyEmail } from "./services/verify-email-service";
export {
  requestPasswordReset,
  resetPassword,
} from "./services/password-reset-service";
export {
  createInvite,
  getInviteByToken,
  resolveOrCreateInvitedUser,
  type CreateInviteInput,
  type AcceptInviteResult,
} from "./services/invite-service";
export {
  beginMfaEnrollment,
  completeMfaEnrollment,
  type BeginMfaEnrollmentResult,
} from "./services/mfa-service";
export { logoutEverywhere, revokeSession } from "./services/session-service";
export {
  seedPlatformOwner,
  type SeedPlatformOwnerInput,
} from "./services/platform-owner-service";
export {
  resolveSsoConfigByEmail,
  getSsoConfigForTenant,
  upsertSsoConfig,
  toPublicSsoConfig,
  buildOidcAuthorizationUrl,
  handleOidcCallback,
  buildSamlAuthorizeUrl,
  handleSamlCallback,
  provisionSsoUser,
  issueSsoTicket,
  consumeSsoTicket,
  encryptOidcFlowState,
  decryptOidcFlowState,
  OIDC_FLOW_COOKIE_NAME,
  type UpsertSsoConfigInput,
  type OidcFlowState,
} from "./services/sso-service";

// Auth.js wiring (handlers/auth/signIn/signOut/installAuthResolver) lives in
// "@atithira/core-identity/auth", not here — it transitively needs "next"
// resolvable (next-auth imports "next/server"), which plain business logic
// like signup()/verifyEmail() must not require (e.g. in non-Next.js test
// runners). See ./auth/index.ts.
