import {
  generateTotpSecret,
  verifyTotpToken,
  generateProvisioningQrCode,
} from "../mfa/totp";
import { encryptSecret } from "../mfa/encryption";
import { generateRecoveryCodes, hashToken } from "../crypto/tokens";
import { getUserRepository } from "../collections";

export interface BeginMfaEnrollmentResult {
  secret: string;
  qrCodeDataUrl: string;
}

export async function beginMfaEnrollment(
  email: string,
): Promise<BeginMfaEnrollmentResult> {
  const secret = generateTotpSecret();
  const qrCodeDataUrl = await generateProvisioningQrCode(email, secret);
  return { secret, qrCodeDataUrl };
}

export async function completeMfaEnrollment(
  userId: string,
  secret: string,
  verificationToken: string,
): Promise<{ recoveryCodes: string[] }> {
  if (!verifyTotpToken(secret, verificationToken)) {
    throw new Error("Invalid verification code");
  }

  const recoveryCodes = generateRecoveryCodes();
  const recoveryCodesHash = recoveryCodes.map(hashToken);

  const userRepo = await getUserRepository();
  await userRepo.enrollMfa(userId, encryptSecret(secret), recoveryCodesHash);

  return { recoveryCodes };
}
