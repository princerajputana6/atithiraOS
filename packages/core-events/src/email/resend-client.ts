import { Resend } from "resend";
import { getEnv } from "@atithira/config";

let client: Resend | undefined;

export function getResendClient(): Resend {
  if (!client) {
    client = new Resend(getEnv().RESEND_API_KEY);
  }
  return client;
}
