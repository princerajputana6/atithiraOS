import { TenantScopedRepository } from "@atithira/db";
import type { Collection, Filter } from "mongodb";
import type { RoleBinding } from "@atithira/types";

export class RoleBindingRepository extends TenantScopedRepository<RoleBinding> {
  protected readonly targetType = "role_binding";

  constructor(collection: Collection<RoleBinding>) {
    super(collection);
  }

  async findForUser(userId: string): Promise<RoleBinding[]> {
    return this.find({ userId } as Filter<RoleBinding>);
  }
}
