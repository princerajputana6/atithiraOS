import { getEnv } from "@atithira/config";
import type { UserRecord } from "@atithira/types";
import { hashPassword } from "../crypto/password";
import { generateToken, hashToken } from "../crypto/tokens";
import { getUserRepository, getEmailVerificationTokenRepository } from "../collections";
import { getResendClient } from "../email/resend-client";

const VERIFICATION_TOKEN_TTL_HOURS = 24;

export interface SignupInput {
  email: string;
  password: string;
  name?: string;
}

/**
 * Creates the (tenant-agnostic) user record and sends the verification email
 * synchronously via Resend — unlike welcome/invite emails, this isn't routed
 * through an Inngest event, since the signer-upper is sitting on the page
 * waiting for it right now.
 */
export async function signup(input: SignupInput): Promise<UserRecord> {
  const userRepo = await getUserRepository();
  const existing = await userRepo.findByEmail(input.email);
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await userRepo.create({
    email: input.email.toLowerCase(),
    emailVerified: null,
    name: input.name,
    passwordHash,
    mfaEnabled: false,
    mfaSecret: null,
    mfaRecoveryCodesHash: [],
    sessionVersion: 0,
    status: "active",
  });

  const rawToken = generateToken();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000,
  );
  const tokenRepo = await getEmailVerificationTokenRepository();
  await tokenRepo.create(user._id, hashToken(rawToken), expiresAt);

  const env = getEnv();
  await getResendClient().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: user.email,
    subject: "Verify your email — Atithira Business OS",
    html: `<p>Confirm your email to finish setting up your workspace.</p>
           <p><a href="${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${rawToken}">Verify email</a></p>`,
  });

  return user;
}
