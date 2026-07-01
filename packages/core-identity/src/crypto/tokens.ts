import { randomBytes, createHash, randomUUID } from "node:crypto";

/** Raw, single-use tokens sent in links/emails — never stored in plaintext. */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () =>
    randomUUID().replace(/-/g, "").slice(0, 10),
  );
}
