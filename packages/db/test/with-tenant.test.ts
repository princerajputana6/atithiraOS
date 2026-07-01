import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoClient, type Collection } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { TenantScopedRepository } from "../src/with-tenant";
import { runWithTenantContext } from "../src/tenant-context";
import { TenantContextMissingError } from "../src/errors";

interface FakeDoc {
  _id: string;
  tenantId: string;
  name: string;
}

class FakeRepository extends TenantScopedRepository<FakeDoc> {
  protected readonly targetType = "fake";
}

let mongoServer: MongoMemoryServer;
let client: MongoClient;
let collection: Collection<FakeDoc>;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  client = new MongoClient(mongoServer.getUri());
  await client.connect();
  collection = client.db("test").collection<FakeDoc>("fakes");
}, 60000);

afterAll(async () => {
  await client?.close();
  await mongoServer?.stop();
});

describe("TenantScopedRepository", () => {
  it("fails closed: throws when no tenant context is active, rather than returning unscoped data", async () => {
    const repo = new FakeRepository(collection);
    await expect(repo.find({})).rejects.toThrow(TenantContextMissingError);
  });

  it("injects tenantId on insert and never leaks documents across tenants on read", async () => {
    const repo = new FakeRepository(collection);

    await runWithTenantContext({ tenantId: "tenant-a", userId: "user-a" }, async () => {
      await repo.insertOne(
        { name: "Alpha" } as Omit<FakeDoc, "_id" | "tenantId">,
        { skipAudit: true },
      );
    });

    await runWithTenantContext({ tenantId: "tenant-b", userId: "user-b" }, async () => {
      await repo.insertOne(
        { name: "Beta" } as Omit<FakeDoc, "_id" | "tenantId">,
        { skipAudit: true },
      );
    });

    await runWithTenantContext({ tenantId: "tenant-a", userId: "user-a" }, async () => {
      const docs = await repo.find({});
      expect(docs).toHaveLength(1);
      expect(docs[0]?.name).toBe("Alpha");
    });

    await runWithTenantContext({ tenantId: "tenant-b", userId: "user-b" }, async () => {
      const docs = await repo.find({});
      expect(docs).toHaveLength(1);
      expect(docs[0]?.name).toBe("Beta");
    });

    // Proves isolation is a query-time filter, not a vacuous "nothing else
    // was created" test — both documents really exist in the same collection.
    const allDocs = await collection.find({}).toArray();
    expect(allDocs).toHaveLength(2);
  });
});
