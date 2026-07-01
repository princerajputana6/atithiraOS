import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";

// The app keeps its env in apps/web/.env.local; also try the repo root so this
// works regardless of where the operator dropped the file.
loadEnv({ path: resolve(process.cwd(), "../apps/web/.env.local") });
loadEnv({ path: resolve(process.cwd(), "../.env.local") });
loadEnv({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const email =
    process.env.SUPER_ADMIN_EMAIL ?? "admin@atithira.com";
  const password =
    process.env.SUPER_ADMIN_PASSWORD ??
    `Atithira@${randomBytes(4).toString("hex")}`;
  const name = process.env.SUPER_ADMIN_NAME ?? "Platform Owner";

  const { seedPlatformOwner } = await import("@atithira/core-identity");
  const result = await seedPlatformOwner({ email, password, name });

  // eslint-disable-next-line no-console
  console.log("\n──────────── Atithira Super Admin ────────────");
  // eslint-disable-next-line no-console
  console.log(`  Status:   ${result.created ? "created" : "updated (already existed)"}`);
  // eslint-disable-next-line no-console
  console.log(`  Email:    ${email}`);
  // eslint-disable-next-line no-console
  console.log(`  Password: ${password}`);
  // eslint-disable-next-line no-console
  console.log(`  Login at: /login  →  redirects to /admin`);
  // eslint-disable-next-line no-console
  console.log("──────────────────────────────────────────────\n");
  // eslint-disable-next-line no-console
  console.log(
    "Store this password now. It is only printed here; the DB stores an argon2 hash.\n",
  );

  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to seed super admin:", err);
  process.exit(1);
});
