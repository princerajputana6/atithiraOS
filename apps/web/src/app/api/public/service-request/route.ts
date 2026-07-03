import { NextResponse } from "next/server";
import { getEnv } from "@atithira/config";
import { getResendClient } from "@atithira/core-events";

const MAX_SERVICES = 20;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = clean(body?.name);
  const email = clean(body?.email).toLowerCase();
  const phone = clean(body?.phone);
  const company = clean(body?.company);
  const message = clean(body?.message);
  const services: string[] = Array.isArray(body?.services)
    ? body.services.map(clean).filter(Boolean).slice(0, MAX_SERVICES)
    : [];

  if (!name || !email || services.length === 0) {
    return NextResponse.json(
      { error: "Name, email, and at least one service are required" },
      { status: 400 },
    );
  }

  const env = getEnv();
  await getResendClient().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: env.RESEND_FROM_EMAIL,
    replyTo: email,
    subject: `New Atithira service request from ${name}`,
    html: `
      <h2>New service request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || "-")}</p>
      <p><strong>Company:</strong> ${escapeHtml(company || "-")}</p>
      <p><strong>Services:</strong></p>
      <ul>${services.map((service) => `<li>${escapeHtml(service)}</li>`).join("")}</ul>
      <p><strong>Notes:</strong></p>
      <p>${escapeHtml(message || "-").replaceAll("\n", "<br />")}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
