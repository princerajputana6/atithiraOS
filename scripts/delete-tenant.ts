import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), "../apps/web/.env.local") });
loadEnv({ path: resolve(process.cwd(), "../.env.local") });
loadEnv({ path: resolve(process.cwd(), ".env.local") });

const SLUG = process.env.DELETE_SLUG ?? process.argv[2] ?? "demo-cafe";

async function main() {
  const { getOrganizationRepository, deleteTenant } = await import("@atithira/core-tenancy");
  const { getUserRepository } = await import("@atithira/core-identity");

  const orgRepo = await getOrganizationRepository();
  const org = await orgRepo.findBySlug(SLUG);
  if (!org) {
    console.log(`No tenant with slug /${SLUG} — nothing to delete.`);
    process.exit(0);
  }

  const ownerUserId = org.ownerUserId;
  await deleteTenant(org._id);
  console.log(`Deleted tenant "${org.name}" (/${SLUG}) and all its data.`);

  const userRepo = await getUserRepository();
  const ownerUser = await userRepo.findById(ownerUserId);
  if (ownerUser && !ownerUser.isPlatformOwner) {
    const otherOrgs = await orgRepo.listByOwner(ownerUserId);
    if (otherOrgs.length === 0) {
      await userRepo.deleteById(ownerUserId);
      console.log(`Deleted orphaned owner user ${ownerUser.email}.`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("delete-tenant failed:", err);
  process.exit(1);
});
