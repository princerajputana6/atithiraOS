import { TenantScopedRepository } from "@atithira/db";
import type { Collection } from "mongodb";
import type { Branch } from "@atithira/types";

export class BranchRepository extends TenantScopedRepository<Branch> {
  protected readonly targetType = "branch";

  constructor(collection: Collection<Branch>) {
    super(collection);
  }
}
