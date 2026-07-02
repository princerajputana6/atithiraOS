import { argon2id, argon2Verify } from "hash-wasm";
import { randomBytes } from "node:crypto";

// Pure-WASM argon2id (hash-wasm) rather than a native addon. Native argon2
// bindings (@node-rs/argon2, argon2) fail to load in Vercel's serverless
// runtime because their platform-specific *.node binary isn't traced into the
// function bundle — which 500s every auth route. WASM ships as bytes in the JS
// bundle, so it runs on any platform/runtime with no tracing hacks.
//
// Parameters match the previous @node-rs/argon2 defaults (argon2id, v19,
// 19 MiB, t=2, p=1, 32-byte hash) and the output is the same PHC-encoded
// string, so passwords hashed by the old binary verify unchanged (confirmed by
// cross-verification) — no re-hash or migration is needed.
const MEMORY_KIB = 19456;
const ITERATIONS = 2;
const PARALLELISM = 1;
const HASH_LENGTH = 32;

export async function hashPassword(password: string): Promise<string> {
  return argon2id({
    password,
    salt: randomBytes(16),
    parallelism: PARALLELISM,
    memorySize: MEMORY_KIB,
    iterations: ITERATIONS,
    hashLength: HASH_LENGTH,
    outputType: "encoded",
  });
}

export async function verifyPassword(
  passwordHash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2Verify({ password, hash: passwordHash });
  } catch {
    // A malformed or unrecognised hash is a failed verification, not an error.
    return false;
  }
}
