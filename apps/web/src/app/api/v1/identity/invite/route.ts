import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS, getRoleRepository } from "@atithira/core-security";
import { createInvite } from "@atithira/core-identity";
import { getTenantContext } from "@atithira/db";
import { getOrganizationRepository } from "@atithira/core-tenancy";
import { ensureBootstrapped } from "@/lib/bootstrap";

// requirePermission() calls resolveActor() before this handler body runs, so
// bootstrapping (which registers the auth resolver) must happen a layer
// above it, not inside the wrapped handler.
const protectedPost = requirePermission(PERMISSIONS.SECURITY_MEMBER_MANAGE)(
  async (req: Request) => {
    const { email, roleKey } = (await req.json().catch(() => ({}))) as {
      email?: string;
      roleKey?: string;
    };
    if (!email || !roleKey) {
      return NextResponse.json(
        { error: "email and roleKey are required" },
        { status: 400 },
      );
    }

    const ctx = getTenantContext();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleRepo = await getRoleRepository();
    const role = await roleRepo.findByKey(roleKey);
    if (!role) {
      return NextResponse.json({ error: "Unknown role" }, { status: 400 });
    }

    const orgRepo = await getOrganizationRepository();
    const org = await orgRepo.findById(ctx.tenantId);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const invite = await createInvite({
      tenantId: ctx.tenantId,
      organizationName: org.name,
      email,
      roleId: String(role._id),
      invitedByUserId: ctx.userId ?? "",
    });

    return NextResponse.json({ inviteId: invite._id }, { status: 201 });
  },
);

export async function POST(req: Request) {
  await ensureBootstrapped();
  return protectedPost(req, undefined);
}
