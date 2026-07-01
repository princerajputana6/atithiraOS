import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getEnv } from "@atithira/config";
import type { PaymentProvider } from "@atithira/types";
import { getTenantConfigRepository } from "../collections";

/**
 * Per-tenant payment gateway credentials. A tenant connects their own gateway
 * (currently Razorpay) so online payments from their website visitors settle
 * into the tenant's own account. The key *secret* is encrypted at rest with
 * AES-256-GCM (same scheme + key as the MFA secrets — MFA_ENCRYPTION_KEY is a
 * general 32-byte app secret) and is never returned to the browser.
 */

const ALGO = "aes-256-gcm";

function key(): Buffer {
  return Buffer.from(getEnv().MFA_ENCRYPTION_KEY, "hex");
}

function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), enc.toString("hex")].join(".");
}

function decrypt(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(".");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Malformed encrypted payment secret");
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}

/** Non-secret view of a tenant's payment setup — safe to send to the browser. */
export interface TenantPaymentInfo {
  connected: boolean;
  provider: PaymentProvider | null;
  keyId: string | null;
  enabled: boolean;
}

export async function getTenantPaymentInfo(): Promise<TenantPaymentInfo> {
  const config = await (await getTenantConfigRepository()).getForTenant();
  const p = config?.payment;
  return {
    connected: !!p,
    provider: p?.provider ?? null,
    keyId: p?.keyId ?? null,
    enabled: p?.enabled ?? false,
  };
}

/** True when the tenant can currently accept online payments. */
export async function isTenantPaymentEnabled(): Promise<boolean> {
  const info = await getTenantPaymentInfo();
  return info.connected && info.enabled;
}

/** Decrypted credentials for server-side gateway calls. Null when not connected. */
export async function getTenantRazorpayCredentials(): Promise<{ keyId: string; keySecret: string } | null> {
  const config = await (await getTenantConfigRepository()).getForTenant();
  const p = config?.payment;
  if (!p || p.provider !== "razorpay" || !p.enabled) return null;
  return { keyId: p.keyId, keySecret: decrypt(p.encryptedKeySecret) };
}

export interface SetTenantPaymentInput {
  provider?: PaymentProvider;
  keyId: string;
  keySecret: string;
  enabled?: boolean;
}

/** Platform/tenant-admin action: store (encrypted) the tenant's gateway keys. */
export async function setTenantPaymentConfig(input: SetTenantPaymentInput): Promise<void> {
  const configRepo = await getTenantConfigRepository();
  await configRepo.updateForTenant({
    $set: {
      payment: {
        provider: input.provider ?? "razorpay",
        keyId: input.keyId.trim(),
        encryptedKeySecret: encrypt(input.keySecret.trim()),
        enabled: input.enabled ?? true,
        updatedAt: new Date(),
      },
    },
  });
}

/** Flip online payment on/off without re-entering keys. */
export async function setTenantPaymentEnabled(enabled: boolean): Promise<void> {
  const configRepo = await getTenantConfigRepository();
  await configRepo.updateForTenant({ $set: { "payment.enabled": enabled } });
}

/** Remove the tenant's stored gateway credentials entirely. */
export async function disconnectTenantPayment(): Promise<void> {
  const configRepo = await getTenantConfigRepository();
  await configRepo.updateForTenant({ $unset: { payment: "" } });
}
