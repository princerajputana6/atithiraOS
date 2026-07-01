import { NextResponse } from "next/server";
import { getModuleAccess, setModuleEnabled } from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import { MODULE_CATALOG } from "@atithira/types";
import type { ModuleKey } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { resolvePlatformOwner } from "@/lib/admin";

const VALID_KEYS = new Set(MODULE_CATALOG.map((m) => m.key));

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { tenantId } = await params;
  const access = await runWithTenantContext(
    { tenantId, userId: null },
    async () => getModuleAccess(),
  );

  const modules = MODULE_CATALOG.map((mod) => ({
    key: mod.key,
    label: mod.label,
    description: mod.description,
    enabled: access[mod.key] === true,
  }));

  return NextResponse.json({ modules });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { tenantId } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    moduleKey?: string;
    enabled?: boolean;
  };
  if (!body.moduleKey || !VALID_KEYS.has(body.moduleKey as ModuleKey)) {
    return NextResponse.json({ error: "Unknown moduleKey" }, { status: 400 });
  }
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
  }

  await runWithTenantContext({ tenantId, userId: owner.userId }, async () => {
    await setModuleEnabled(body.moduleKey as ModuleKey, body.enabled as boolean);
  });

  return NextResponse.json({ ok: true });
}
