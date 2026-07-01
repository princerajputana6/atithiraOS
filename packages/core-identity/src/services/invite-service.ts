import { publishEvent } from "@atithira/core-events";
import type { Invite } from "@atithira/types";
import { generateToken, hashToken } from "../crypto/tokens";
import { getInviteRepository, getUserRepository } from "../collections";
import { hashPassword } from "../crypto/password";

const INVITE_TTL_DAYS = 7;

export interface CreateInviteInput {
  tenantId: string;
  organizationName: string;
  email: string;
  roleId: string;
  invitedByUserId: string;
}

/** Call inside runWithTenantContext for the inviting tenant. */
export async function createInvite(input: CreateInviteInput): Promise<Invite> {
  const inviteRepo = await getInviteRepository();
  const rawToken = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const invite = await inviteRepo.insertOne(
    {
      email: input.email.toLowerCase(),
      invitedByUserId: input.invitedByUserId,
      roleId: input.roleId,
      tokenHash: hashToken(rawToken),
      expiresAt,
      status: "pending",
      createdAt: new Date(),
    } as Omit<Invite, "_id" | "tenantId">,
    { action: "invite.created" },
  );

  await publishEvent("user/invited", {
    tenantId: input.tenantId,
    organizationName: input.organizationName,
    inviteId: String(invite._id),
    email: input.email,
    invitedByUserId: input.invitedByUserId,
    token: rawToken,
  });

  return invite;
}

/** No tenant context required — looks the invite up by its raw token. */
export async function getInviteByToken(rawToken: string): Promise<Invite | null> {
  const inviteRepo = await getInviteRepository();
  return inviteRepo.findByTokenHashUnscoped(hashToken(rawToken));
}

export interface AcceptInviteResult {
  userId: string;
  isNewUser: boolean;
}

/**
 * Creates the invited user if they don't already exist (e.g. first invite
 * for this email anywhere on the platform) or reuses their existing global
 * identity. Does NOT create the membership/role binding or mark the invite
 * accepted — the calling route handler orchestrates that inside
 * runWithTenantContext({ tenantId: invite.tenantId, ... }) using
 * core-tenancy and core-security, since those are outside this package's
 * responsibility.
 */
export async function resolveOrCreateInvitedUser(
  invite: Invite,
  opts: { password?: string; name?: string },
): Promise<AcceptInviteResult> {
  const userRepo = await getUserRepository();
  const existing = await userRepo.findByEmail(invite.email);
  if (existing) {
    return { userId: existing._id, isNewUser: false };
  }

  if (!opts.password) {
    throw new Error("Password is required to create an account");
  }

  const passwordHash = await hashPassword(opts.password);
  const user = await userRepo.create({
    email: invite.email,
    // Accepting an invite proves control of the inbox that received it.
    emailVerified: new Date(),
    name: opts.name,
    passwordHash,
    mfaEnabled: false,
    mfaSecret: null,
    mfaRecoveryCodesHash: [],
    sessionVersion: 0,
    status: "active",
  });

  return { userId: user._id, isNewUser: true };
}
