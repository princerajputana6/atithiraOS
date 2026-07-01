import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), "../apps/web/.env.local") });
loadEnv({ path: resolve(process.cwd(), "../.env.local") });
loadEnv({ path: resolve(process.cwd(), ".env.local") });

const EMAIL = process.env.DEMO_EMAIL ?? "cafe@demo.com";
const PASSWORD = process.env.DEMO_PASSWORD ?? "Demo@Website123";
const SLUG = process.env.DEMO_SLUG ?? "demo-cafe";

async function main() {
  const { signup, getUserRepository } = await import("@atithira/core-identity");
  const {
    createOrganizationForNewUser,
    getOrganizationRepository,
    setModuleEnabled,
  } = await import("@atithira/core-tenancy");
  const { runWithTenantContext } = await import("@atithira/db");

  const userRepo = await getUserRepository();
  let user = await userRepo.findByEmail(EMAIL);
  if (!user) {
    user = await signup({ email: EMAIL, password: PASSWORD, name: "Demo Cafe Owner" });
    console.log(`  Created user ${EMAIL}`);
  } else {
    console.log(`  Reusing existing user ${EMAIL}`);
  }
  // Login requires a verified email (see auth-config authorize); a demo owner
  // is trusted, so mark it verified rather than round-tripping an email.
  await userRepo.markEmailVerified(user._id);

  const orgRepo = await getOrganizationRepository();
  let org = await orgRepo.findBySlug(SLUG);
  if (!org) {
    org = await createOrganizationForNewUser({
      organizationName: "Demo Cafe",
      slug: SLUG,
      ownerUserId: user._id,
      ownerEmail: user.email,
    });
    console.log(`  Created tenant "${org.name}" (/${org.slug})`);
  } else {
    console.log(`  Reusing existing tenant /${SLUG}`);
  }

  // Enable the Website module for this tenant (default-off otherwise).
  await runWithTenantContext({ tenantId: org._id, userId: user._id }, async () => {
    await setModuleEnabled("website", true);
  });
  console.log("  Website module ENABLED for this tenant");

  console.log("\n──────────── Website demo tenant ────────────");
  console.log(`  Login email:    ${EMAIL}`);
  console.log(`  Login password: ${PASSWORD}`);
  console.log(`  Dashboard:      /dashboard/website`);
  console.log(`  Public site:    /site/${SLUG}`);
  console.log("──────────────────────────────────────────────\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("seed-website-demo failed:", err);
  process.exit(1);
});
