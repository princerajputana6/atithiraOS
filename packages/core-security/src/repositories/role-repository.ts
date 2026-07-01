import { TenantScopedRepository } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import type { Role } from "@atithira/types";

export class RoleRepository extends TenantScopedRepository<Role> {
  protected readonly targetType = "role";

  constructor(collection: Collection<Role>) {
    super(collection);
  }

  async findByKey(key: string): Promise<Role | null> {
    return this.findOne({ key } as Filter<Role>);
  }

  async findById(roleId: string): Promise<Role | null> {
    return this.findOne({ _id: new ObjectId(roleId) } as unknown as Filter<Role>);
  }
}
