import { authenticator } from "otplib";
import QRCode from "qrcode";

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotpToken(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export async function generateProvisioningQrCode(
  email: string,
  secret: string,
): Promise<string> {
  const otpauthUrl = authenticator.keyuri(email, "Atithira Business OS", secret);
  return QRCode.toDataURL(otpauthUrl);
}
