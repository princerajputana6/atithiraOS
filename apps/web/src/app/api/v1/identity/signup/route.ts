import { NextResponse } from "next/server";
import { signup } from "@atithira/core-identity";
import { createOrganizationForNewUser } from "@atithira/core-tenancy";
import { ensureBootstrapped } from "@/lib/bootstrap";

export async function POST(req: Request) {
  await ensureBootstrapped();
  const body = await req.json().catch(() => null);
  const { email, password, name, organizationName, slug } = body ?? {};

  if (!email || !password || !organizationName || !slug) {
    return NextResponse.json(
      { error: "email, password, organizationName, and slug are required" },
      { status: 400 },
    );
  }

  try {
    const user = await signup({ email, password, name });
    const org = await createOrganizationForNewUser({
      organizationName,
      slug,
      ownerUserId: user._id,
      ownerEmail: user.email,
    });
    return NextResponse.json(
      { userId: user._id, tenantId: org._id },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
