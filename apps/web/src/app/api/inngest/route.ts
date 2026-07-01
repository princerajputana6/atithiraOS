import { serve } from "inngest/next";
import { inngest, inngestFunctions } from "@atithira/core-events";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
