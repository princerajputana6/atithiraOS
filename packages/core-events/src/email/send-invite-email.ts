import { getEnv } from "@atithira/config";
import { getResendClient } from "./resend-client";
import type { EventDataFor } from "@atithira/types";

export async function sendInviteEmail(
  data: EventDataFor<"user/invited">,
): Promise<void> {
  const env = getEnv();
  const acceptUrl = `${env.NEXT_PUBLIC_APP_URL}/invite/${data.token}`;
  await getResendClient().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: data.email,
    subject: `You've been invited to join ${data.organizationName} on Atithira`,
    html: `<p>You've been invited to join <strong>${data.organizationName}</strong>.</p>
           <p><a href="${acceptUrl}">Accept invite</a></p>`,
  });
}
