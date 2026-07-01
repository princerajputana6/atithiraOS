import { inngest } from "../client";
import { sendInviteEmail } from "../email/send-invite-email";

export const onUserInvited = inngest.createFunction(
  { id: "on-user-invited" },
  { event: "user/invited" },
  async ({ event, step }) => {
    await step.run("send-invite-email", () => sendInviteEmail(event.data));
  },
);
