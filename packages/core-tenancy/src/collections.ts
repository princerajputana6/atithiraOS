import { getDb } from "@atithira/db";
import type {
  Organization,
  Branch,
  Department,
  TenantConfig,
  Membership,
} from "@atithira/types";
import { OrganizationRepository } from "./repositories/organization-repository";
import { BranchRepository } from "./repositories/branch-repository";
import { DepartmentRepository } from "./repositories/department-repository";
import { TenantConfigRepository } from "./repositories/tenant-config-repository";
import { MembershipRepository } from "./repositories/membership-repository";

export async function getOrganizationRepository(): Promise<OrganizationRepository> {
  const db = await getDb();
  return new OrganizationRepository(db.collection<Organization>("organizations"));
}

export async function getBranchRepository(): Promise<BranchRepository> {
  const db = await getDb();
  return new BranchRepository(db.collection<Branch>("branches"));
}

export async function getDepartmentRepository(): Promise<DepartmentRepository> {
  const db = await getDb();
  return new DepartmentRepository(db.collection<Department>("departments"));
}

export async function getTenantConfigRepository(): Promise<TenantConfigRepository> {
  const db = await getDb();
  return new TenantConfigRepository(db.collection<TenantConfig>("tenant_config"));
}

export async function getMembershipRepository(): Promise<MembershipRepository> {
  const db = await getDb();
  return new MembershipRepository(db.collection<Membership>("memberships"));
}
