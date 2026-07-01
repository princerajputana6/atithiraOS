import { randomBytes, createHash } from "node:crypto";
import type { ApiKey } from "@atithira/types";
import { getApiKeyRepository } from "./repository";

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export interface CreatedApiKey {
  record: ApiKey;
  /** The raw key — returned exactly once, never stored in plaintext. */
  plaintextKey: string;
}

/** Call inside runWithTenantContext for the owning tenant. */
export async function createApiKey(
  name: string,
  scopes: string[] = ["*"],
): Promise<CreatedApiKey> {
  const raw = `atk_live_${randomBytes(24).toString("hex")}`;
  const prefix = raw.slice(0, 16);
  const repo = await getApiKeyRepository();
  const record = await repo.insertOne(
    {
      name,
      prefix,
      keyHash: hashKey(raw),
      scopes,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    } as Omit<ApiKey, "_id" | "tenantId">,
    { action: "api_key.created" },
  );
  return { record, plaintextKey: raw };
}

export async function listApiKeys(): Promise<ApiKey[]> {
  return (await getApiKeyRepository()).listActive();
}

export async function revokeApiKey(id: string): Promise<void> {
  const repo = await getApiKeyRepository();
  await repo.revoke(id);
}

export interface VerifiedApiKey {
  tenantId: string;
  keyId: string;
  scopes: string[];
}

/**
 * Verifies an inbound raw API key (no tenant context needed) and returns the
 * tenant + scopes to adopt. Used by the platform's API-key auth path so the
 * SDK can call the API on a tenant's behalf.
 */
export async function verifyApiKey(
  rawKey: string,
): Promise<VerifiedApiKey | null> {
  if (!rawKey.startsWith("atk_")) return null;
  const repo = await getApiKeyRepository();
  const record = await repo.findByHashUnscoped(hashKey(rawKey));
  if (!record) return null;
  await repo.touchLastUsedUnscoped(record._id);
  return {
    tenantId: record.tenantId,
    keyId: record._id,
    scopes: record.scopes,
  };
}
