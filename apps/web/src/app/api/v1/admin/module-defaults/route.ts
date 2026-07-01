import { NextResponse } from "next/server";
import { getEffectiveModuleCatalog, setPlatformModuleDefault } from "@atithira/core-tenancy";
import { MODULE_CATALOG } from "@atithira/types";
import type { ModuleKey } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { resolvePlatformOwner } from "@/lib/admin";

const VALID_KEYS = new Set(MODULE_CATALOG.map((m) => m.key));

export async function GET() {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const modules = await getEffectiveModuleCatalog();
  return NextResponse.json({ modules });
}

export async function PATCH(req: Request) {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  await setPlatformModuleDefault(body.moduleKey as ModuleKey, body.enabled);

  return NextResponse.json({ ok: true });
}
