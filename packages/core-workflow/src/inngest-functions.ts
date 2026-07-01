import { inngest } from "@atithira/core-events";
import { WORKFLOW_TRIGGER_EVENTS } from "@atithira/types";
import { runWorkflowsForEvent } from "./services";

// Inngest caps a single function at 10 triggers, so we chunk the domain-event
// list into groups of ≤10 and create one dispatcher function per chunk. Each
// receives its matched event and dispatches to whatever tenant rules match —
// this is the bridge that turns the event bus into the no-code automation
// engine.
const CHUNK_SIZE = 10;

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const workflowInngestFunctions = chunk(
  WORKFLOW_TRIGGER_EVENTS,
  CHUNK_SIZE,
).map((events, index) =>
  inngest.createFunction(
    { id: `workflow-runner-${index}` },
    events.map((event) => ({ event })),
    async ({ event, step }) => {
      await step.run("dispatch-workflows", () =>
        runWorkflowsForEvent(
          event.name,
          (event.data ?? {}) as Record<string, unknown>,
        ),
      );
    },
  ),
);
