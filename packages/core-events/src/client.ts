import { EventSchemas, Inngest } from "inngest";
import type { EventName, EventDataFor } from "@atithira/types";

type InngestEventMap = {
  [K in EventName]: { data: EventDataFor<K> };
};

export const inngest = new Inngest({
  id: "atithira-os",
  schemas: new EventSchemas().fromRecord<InngestEventMap>(),
});
