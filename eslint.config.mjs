import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Tenant isolation guardrail: only packages/db is allowed to construct a
// MongoClient (or reach into getDb()'s connection machinery). Every other
// package must go through @atithira/db's getDb()/TenantScopedRepository —
// Collection/Filter/ObjectId type imports from "mongodb" stay unrestricted
// everywhere since repositories need them for typing.
const restrictMongoClient = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "mongodb",
            importNames: ["MongoClient"],
            message:
              "Only @atithira/db may construct a MongoClient. Use getDb() from @atithira/db instead.",
          },
        ],
      },
    ],
  },
};

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["packages/db/**"],
    ...restrictMongoClient,
  },
);
