import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These have native or dynamic-require internals that must not be bundled by
  // webpack — Node requires them from node_modules at runtime instead.
  // (Password hashing is pure-WASM hash-wasm now, so there is no native argon2
  // binary to special-case — see core-identity/src/crypto/password.ts.)
  serverExternalPackages: [
    "mongodb",
    "pino",
    "@opentelemetry/sdk-node",
    "@opentelemetry/auto-instrumentations-node",
  ],
  transpilePackages: [
    "@atithira/config",
    "@atithira/db",
    "@atithira/types",
    "@atithira/core-identity",
    "@atithira/core-tenancy",
    "@atithira/core-security",
    "@atithira/core-billing",
    "@atithira/core-events",
    "@atithira/core-storage",
    "@atithira/module-crm",
    "@atithira/module-finance",
    "@atithira/module-people",
    "@atithira/module-inventory",
    "@atithira/module-projects",
    "@atithira/module-restaurant",
    "@atithira/module-hotel",
    "@atithira/module-clinic",
    "@atithira/module-retail",
    "@atithira/module-website",
    "@atithira/core-workflow",
    "@atithira/core-ai",
    "@atithira/core-developer",
    "@atithira/core-marketplace",
    "@atithira/core-analytics",
    "@atithira/core-search",
    "@atithira/core-reporting",
    "@atithira/core-observability",
    "@atithira/sdk",
  ],
};

export default nextConfig;
