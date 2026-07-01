import { EventSchemas, Inngest } from "inngest";
import type { EventName, EventDataFor } from "@atithira/types";

type InngestEventMap = {
  [K in EventName]: { data: EventDataFor<K> };
};

/**
 * Dev vs. cloud transport. Outside production we force `isDev`, which points
 * the SDK at the local Inngest Dev Server (http://localhost:8288) instead of
 * Inngest Cloud. This is the fix for the "401 Event key not found" seen when
 * INNGEST_EVENT_KEY is set to a value Cloud rejects: in local dev the SDK
 * should never talk to Cloud. To actually process events locally, run the dev
 * server alongside `next dev`:  `npx inngest-cli@latest dev`.
 *
 * In production, `isDev` is false and the SDK uses INNGEST_EVENT_KEY /
 * INNGEST_SIGNING_KEY to reach Inngest Cloud as normal. Set INNGEST_DEV=false
 * to override (e.g. to test a real Cloud key from a local build).
 */
const isDev =
  process.env.INNGEST_DEV === "true" ||
  (process.env.INNGEST_DEV !== "false" && process.env.NODE_ENV !== "production");

export const inngest = new Inngest({
  id: "atithira-os",
  isDev,
  schemas: new EventSchemas().fromRecord<InngestEventMap>(),
});
