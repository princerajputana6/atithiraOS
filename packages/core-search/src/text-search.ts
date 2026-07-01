import type { Collection, Document } from "mongodb";

/**
 * Generic $text search helper any tenant-scoped repository can call from
 * inside its own class (keeping `this.collection` access encapsulated —
 * core-search never touches another module's collection directly, only
 * provides the reusable machinery). Boring-but-proven: MongoDB's built-in
 * text index rather than standing up a separate search cluster.
 */

export async function ensureTextIndex<T extends Document>(
  collection: Collection<T>,
  fields: Record<string, "text">,
): Promise<void> {
  try {
    await collection.createIndex(fields, {
      name: `${collection.collectionName}_text`,
    });
  } catch {
    // Idempotent by intent: a differently-shaped text index already exists
    // (e.g. from a prior deploy) — creation failing here must never crash
    // boot, since search is a nice-to-have, not a kernel dependency.
  }
}

export async function textSearch<T extends Document>(
  collection: Collection<T>,
  tenantId: string,
  query: string,
  limit = 20,
): Promise<T[]> {
  const docs = await collection
    .find({ tenantId, $text: { $search: query } } as never, {
      projection: { score: { $meta: "textScore" } },
    } as never)
    .sort({ score: { $meta: "textScore" } } as never)
    .limit(limit)
    .toArray();
  return docs as unknown as T[];
}
