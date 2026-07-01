import type { EventName, EventDataFor } from "@atithira/types";
import { inngest } from "./client";

/**
 * The only way any other package/app is allowed to emit a domain event —
 * keeps the Inngest SDK isolated to this package so a future transport swap
 * (e.g. to Kafka, at scale) touches only this function.
 */
export async function publishEvent<N extends EventName>(
  name: N,
  data: EventDataFor<N>,
): Promise<void> {
  // The public signature above is the type-safe contract callers rely on;
  // inngest.send()'s overloads can't correlate a generic name/data pair, so
  // the cast is confined to this one internal call.
  await inngest.send({ name, data } as Parameters<typeof inngest.send>[0]);
}
