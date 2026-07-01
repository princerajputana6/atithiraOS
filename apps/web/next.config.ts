import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native-binding packages (prebuilt .node files) must not be bundled by
  // webpack/turbopack — let Node's own require() load them at runtime on
  // the server instead.
  serverExternalPackages: [
    "@node-rs/argon2",
    "@node-rs/argon2-darwin-arm64",
    "@node-rs/argon2-darwin-x64",
    "@node-rs/argon2-linux-x64-gnu",
    "@node-rs/argon2-linux-arm64-gnu",
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
  // Belt-and-suspenders: serverExternalPackages alone doesn't reliably keep
  // @node-rs/argon2's native binding out of the bundle when it's only
  // reachable through a transpiled workspace package. Marking it as a raw
  // webpack external (server builds only) does.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("@node-rs/argon2");
    }
    return config;
  },
};

export default nextConfig;
