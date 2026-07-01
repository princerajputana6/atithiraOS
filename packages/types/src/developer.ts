export interface ApiKey {
  _id: string;
  tenantId: string;
  name: string;
  prefix: string; // first chars, shown in UI (e.g. "atk_live_ab12")
  keyHash: string; // sha256 of the full key; the raw key is shown once
  scopes: string[]; // "*" = full tenant access
  lastUsedAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
}
