import type { Collection, Filter } from "mongodb";
import type { Plan, PlanKey } from "@atithira/types";

/** Global catalog, not tenant-scoped — every tenant reads the same plans. */
export class PlanRepository {
  constructor(private readonly collection: Collection<Plan>) {}

  async findByKey(key: PlanKey): Promise<Plan | null> {
    return this.collection.findOne({ key } as Filter<Plan>);
  }

  async list(): Promise<Plan[]> {
    return this.collection.find({}).toArray();
  }

  async upsert(plan: Omit<Plan, "_id">): Promise<void> {
    await this.collection.updateOne(
      { key: plan.key } as Filter<Plan>,
      { $set: plan },
      { upsert: true },
    );
  }
}
