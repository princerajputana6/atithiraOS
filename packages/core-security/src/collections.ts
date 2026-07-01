import { getDb } from "@atithira/db";
import type { Role, RoleBinding, AuditLogEntry } from "@atithira/types";
import { RoleRepository } from "./repositories/role-repository";
import { RoleBindingRepository } from "./repositories/role-binding-repository";
import { AuditLogRepository } from "./repositories/audit-log-repository";

export async function getRoleRepository(): Promise<RoleRepository> {
  const db = await getDb();
  return new RoleRepository(db.collection<Role>("roles"));
}

export async function getRoleBindingRepository(): Promise<RoleBindingRepository> {
  const db = await getDb();
  return new RoleBindingRepository(db.collection<RoleBinding>("role_bindings"));
}

export async function getAuditLogRepository(): Promise<AuditLogRepository> {
  const db = await getDb();
  return new AuditLogRepository(db.collection<AuditLogEntry>("audit_logs"));
}
