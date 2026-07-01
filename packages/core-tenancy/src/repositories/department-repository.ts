import { TenantScopedRepository } from "@atithira/db";
import type { Collection } from "mongodb";
import type { Department } from "@atithira/types";

export class DepartmentRepository extends TenantScopedRepository<Department> {
  protected readonly targetType = "department";

  constructor(collection: Collection<Department>) {
    super(collection);
  }
}
