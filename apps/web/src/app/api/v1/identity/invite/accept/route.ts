import { NextResponse } from "next/server";
import {
  getInviteByToken,
  resolveOrCreateInvitedUser,
  getInviteRepository,
} from "@atithira/core-identity";
import { runWithTenantContext } from "@atithira/db";
import { getMembershipRepository } from "@atithira/core-tenancy";
import { assignRole } from "@atithira/core-security";
import { publishEvent } from "@atithira/core-events";
import type { Membership } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";

export async function POST(req: Request) {
  await ensureBootstrapped();
  const { token, password, name } = (await req.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
    name?: string;
  };
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const invite = await getInviteByToken(token);
  if (!invite) {
    return NextResponse.json(
      { error: "Invalid or expired invite" },
      { status: 400 },
    );
  }

  try {
    const { userId } = await resolveOrCreateInvitedUser(invite, {
      password,
      name,
    });

    await runWithTenantContext(
      { tenantId: invite.tenantId, userId },
      async () => {
        const membershipRepo = await getMembershipRepository();
        await membershipRepo.insertOne(
          {
            userId,
            status: "active",
            joinedAt: new Date(),
            createdAt: new Date(),
          } as Omit<Membership, "_id" | "tenantId">,
          { action: "membership.created" },
        );

        await assignRole(userId, invite.roleId, { level: "org" });

        const inviteRepo = await getInviteRepository();
        await inviteRepo.markAccepted(String(invite._id));

        await publishEvent("user/invite.accepted", {
          tenantId: invite.tenantId,
          userId,
          inviteId: String(invite._id),
        });
      },
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not accept invite";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
