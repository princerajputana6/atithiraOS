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
