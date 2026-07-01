export type UserStatus = "active" | "disabled";
export type MembershipStatus = "invited" | "active" | "suspended" | "removed";
export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

export interface UserRecord {
  _id: string;
  email: string;
  emailVerified: Date | null;
  name?: string;
  image?: string;
  /** Absent for SSO-only users, who authenticate via their tenant's IdP instead. */
  passwordHash?: string;
  mfaEnabled: boolean;
  mfaSecret?: string | null;
  mfaRecoveryCodesHash: string[];
  sessionVersion: number;
  status: UserStatus;
  /** Global Atithira staff (Platform Owner). Not tied to any tenant. */
  isPlatformOwner?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  _id: string;
  tenantId: string;
  userId: string;
  status: MembershipStatus;
  invitedByUserId?: string;
  joinedAt: Date | null;
  createdAt: Date;
}

export interface Invite {
  _id: string;
  tenantId: string;
  email: string;
  invitedByUserId: string;
  roleId: string;
  tokenHash: string;
  expiresAt: Date;
  status: InviteStatus;
  createdAt: Date;
}

export interface EmailVerificationToken {
  _id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface PasswordResetToken {
  _id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}
