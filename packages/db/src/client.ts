import { MongoClient, type Db } from "mongodb";
import { getEnv } from "@atithira/config";

// Cached on globalThis so warm serverless invocations (and Next.js dev-mode
// HMR) reuse the same connection instead of opening a new one per request,
// which is what causes connection-storm exhaustion against Atlas M0's
// 500-connection cap.
declare global {
  // eslint-disable-next-line no-var
  var __atithiraMongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(getEnv().MONGODB_URI);
  return client.connect();
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalThis.__atithiraMongoClientPromise) {
    globalThis.__atithiraMongoClientPromise = createClientPromise();
  }
  return globalThis.__atithiraMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db();
}
