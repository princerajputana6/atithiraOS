import type { Role, RoleBinding, RoleBindingScope } from "@atithira/types";
import {
  getRoleRepository,
  getRoleBindingRepository,
} from "../collections";
import { DEFAULT_ROLE_TEMPLATES } from "../roles/default-roles";
import { WILDCARD_PERMISSION } from "../permissions/catalog";

/**
 * Seeds the tenant-scoped default roles (org_owner, business_admin,
 * department_manager, employee) into a freshly created tenant. Must be called
 * while runWithTenantContext({ tenantId: <new tenant> }) is active, as part of
 * provisioning — synchronously, not deferred to an event handler, since the
 * very next provisioning step (binding the creator to org_owner) depends on
 * the role existing.
 */
export async function seedDefaultRolesForTenant(
  tenantId: string,
): Promise<Record<string, string>> {
  const roleRepo = await getRoleRepository();
  const roleIdsByKey: Record<string, string> = {};

  for (const template of DEFAULT_ROLE_TEMPLATES.filter((t) => t.seedPerTenant)) {
    const created = await roleRepo.insertOne(
      {
        tenantId,
        key: template.key,
        name: template.name,
        permissions: template.permissions,
        isSystemDefault: true,
      } as Omit<Role, "_id">,
      { skipAudit: true },
    );
    roleIdsByKey[template.key] = String(created._id);
  }

  return roleIdsByKey;
}

export async function assignRole(
  userId: string,
  roleId: string,
  scope: RoleBindingScope,
): Promise<void> {
  const bindingRepo = await getRoleBindingRepository();
  await bindingRepo.insertOne({
    userId,
    roleId,
    scope,
    createdAt: new Date(),
  } as Omit<RoleBinding, "_id" | "tenantId">);
}

export async function can(userId: string, permission: string): Promise<boolean> {
  const bindingRepo = await getRoleBindingRepository();
  const roleRepo = await getRoleRepository();

  const bindings = await bindingRepo.findForUser(userId);
  if (bindings.length === 0) return false;

  const roles = await Promise.all(
    bindings.map((binding) => roleRepo.findById(binding.roleId)),
  );

  return roles.some(
    (role) =>
      !!role &&
      (role.permissions.includes(WILDCARD_PERMISSION) ||
        role.permissions.includes(permission)),
  );
}

export async function getRolesForUser(userId: string): Promise<Role[]> {
  const bindingRepo = await getRoleBindingRepository();
  const roleRepo = await getRoleRepository();
  const bindings = await bindingRepo.findForUser(userId);
  const roles = await Promise.all(
    bindings.map((binding) => roleRepo.findById(binding.roleId)),
  );
  return roles.filter((role): role is Role => role !== null);
}
