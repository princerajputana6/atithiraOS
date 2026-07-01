import type { EventName, EventDataFor } from "@atithira/types";
import { inngest } from "./client";

/**
 * The only way any other package/app is allowed to emit a domain event —
 * keeps the Inngest SDK isolated to this package so a future transport swap
 * (e.g. to Kafka, at scale) touches only this function.
 *
 * Domain events drive *side-effects only* (welcome email, analytics, workflow
 * triggers). A transport failure — e.g. Inngest keys unset or invalid in a ₹0
 * / local setup — must never roll back the business transaction that emitted
 * the event. So a failed send is logged and swallowed, matching the graceful
 * degradation the platform uses for other optional infra (AI, Razorpay, OTel).
 */
export async function publishEvent<N extends EventName>(
  name: N,
  data: EventDataFor<N>,
): Promise<void> {
  try {
    // The public signature above is the type-safe contract callers rely on;
    // inngest.send()'s overloads can't correlate a generic name/data pair, so
    // the cast is confined to this one internal call.
    await inngest.send({ name, data } as Parameters<typeof inngest.send>[0]);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(
      `[events] Failed to publish "${name}" (side-effects skipped): ${reason}`,
    );
  }
}
