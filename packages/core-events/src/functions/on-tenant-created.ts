import { inngest } from "../client";
import { sendWelcomeEmail } from "../email/send-welcome-email";

export const onTenantCreated = inngest.createFunction(
  { id: "on-tenant-created" },
  { event: "tenant/created" },
  async ({ event, step }) => {
    await step.run("send-welcome-email", () => sendWelcomeEmail(event.data));
  },
);
