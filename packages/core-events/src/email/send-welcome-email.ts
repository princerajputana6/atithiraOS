import { getEnv } from "@atithira/config";
import { getResendClient } from "./resend-client";
import type { EventDataFor } from "@atithira/types";

export async function sendWelcomeEmail(
  data: EventDataFor<"tenant/created">,
): Promise<void> {
  const env = getEnv();
  await getResendClient().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: data.ownerEmail,
    subject: `Welcome to Atithira, ${data.organizationName}!`,
    html: `<p>Your workspace <strong>${data.organizationName}</strong> is ready.</p>
           <p><a href="${env.NEXT_PUBLIC_APP_URL}/dashboard">Open your dashboard</a></p>`,
  });
}
