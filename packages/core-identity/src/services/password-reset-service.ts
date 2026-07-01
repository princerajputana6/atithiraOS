import { getEnv } from "@atithira/config";
import { hashPassword } from "../crypto/password";
import { generateToken, hashToken } from "../crypto/tokens";
import { getUserRepository, getPasswordResetTokenRepository } from "../collections";
import { getResendClient } from "../email/resend-client";

const RESET_TOKEN_TTL_HOURS = 1;

export async function requestPasswordReset(email: string): Promise<void> {
  const userRepo = await getUserRepository();
  const user = await userRepo.findByEmail(email);
  // Do not reveal whether the account exists.
  if (!user) return;

  const rawToken = generateToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000);
  const tokenRepo = await getPasswordResetTokenRepository();
  await tokenRepo.create(user._id, hashToken(rawToken), expiresAt);

  const env = getEnv();
  await getResendClient().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: user.email,
    subject: "Reset your password — Atithira Business OS",
    html: `<p>Reset your password. This link expires in ${RESET_TOKEN_TTL_HOURS} hour.</p>
           <p><a href="${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}">Reset password</a></p>`,
  });
}

export async function resetPassword(
  rawToken: string,
  newPassword: string,
): Promise<void> {
  const tokenRepo = await getPasswordResetTokenRepository();
  const record = await tokenRepo.findValidByHash(hashToken(rawToken));
  if (!record) {
    throw new Error("Invalid or expired reset token");
  }

  const userRepo = await getUserRepository();
  const passwordHash = await hashPassword(newPassword);
  // setPasswordHash also bumps sessionVersion — resetting a password logs out every existing session.
  await userRepo.setPasswordHash(record.userId, passwordHash);
  await tokenRepo.markUsed(String(record._id));
}
