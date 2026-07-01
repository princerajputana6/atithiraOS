import { getDb } from "@atithira/db";

/**
 * Idempotent index setup, called once at app boot. TTL indexes let
 * short-lived tokens and denylist entries self-expire instead of needing a
 * cleanup job — important since Phase 1 has no cron/worker infrastructure.
 */
export async function ensureIdentityIndexes(): Promise<void> {
  const db = await getDb();

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db
    .collection("email_verification_tokens")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db
    .collection("password_reset_tokens")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db
    .collection("session_denylist")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db
    .collection("invites")
    .createIndex({ tenantId: 1, tokenHash: 1 }, { unique: true });
  await db.collection("sso_configs").createIndex({ tenantId: 1 }, { unique: true });
  await db.collection("sso_configs").createIndex({ emailDomains: 1 });
  await db
    .collection("sso_tickets")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
