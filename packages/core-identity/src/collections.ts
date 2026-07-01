import { getDb } from "@atithira/db";
import type {
  UserRecord,
  Invite,
  EmailVerificationToken,
  PasswordResetToken,
} from "@atithira/types";
import { UserRepository } from "./repositories/user-repository";
import { InviteRepository } from "./repositories/invite-repository";
import { EmailVerificationTokenRepository } from "./repositories/email-verification-token-repository";
import { PasswordResetTokenRepository } from "./repositories/password-reset-token-repository";
import {
  SessionDenylistRepository,
  type SessionDenylistEntry,
} from "./repositories/session-denylist-repository";

export async function getUserRepository(): Promise<UserRepository> {
  const db = await getDb();
  return new UserRepository(db.collection<UserRecord>("users"));
}

export async function getInviteRepository(): Promise<InviteRepository> {
  const db = await getDb();
  return new InviteRepository(db.collection<Invite>("invites"));
}

export async function getEmailVerificationTokenRepository(): Promise<EmailVerificationTokenRepository> {
  const db = await getDb();
  return new EmailVerificationTokenRepository(
    db.collection<EmailVerificationToken>("email_verification_tokens"),
  );
}

export async function getPasswordResetTokenRepository(): Promise<PasswordResetTokenRepository> {
  const db = await getDb();
  return new PasswordResetTokenRepository(
    db.collection<PasswordResetToken>("password_reset_tokens"),
  );
}

export async function getSessionDenylistRepository(): Promise<SessionDenylistRepository> {
  const db = await getDb();
  return new SessionDenylistRepository(
    db.collection<SessionDenylistEntry>("session_denylist"),
  );
}
