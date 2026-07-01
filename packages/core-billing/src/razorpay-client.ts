import Razorpay from "razorpay";
import { getEnv } from "@atithira/config";

let client: Razorpay | null | undefined;

/** True when RAZORPAY_KEY_ID/SECRET are set — gates checkout the same way ANTHROPIC_API_KEY gates the AI Copilot. */
export function isRazorpayConfigured(): boolean {
  const env = getEnv();
  return !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayClient(): Razorpay {
  if (client) return client;
  const env = getEnv();
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay is not configured (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET unset)");
  }
  client = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
  return client;
}
