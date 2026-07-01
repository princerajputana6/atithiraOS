import { serve } from "inngest/next";
import { inngest, inngestFunctions } from "@atithira/core-events";
import { workflowInngestFunctions } from "@atithira/core-workflow";
import { weeklyTrialBalanceReport } from "@atithira/core-reporting/scheduled";
import { registerWorkflowActions } from "@/lib/runtime-hooks";
// Side effect: registers the "trial-balance" report the cron function below
// looks up by key. This route is a separate serverless entry point from the
// rest of the app, so it can't rely on ensureBootstrapped() having run.
import "@atithira/module-finance";

// The workflow-runner function executes tenant automation (reaching
// module-projects via the registered create_task action and writing
// audit-logged data), so the audit hook + action registry must be installed
// before any event is dispatched. registerWorkflowActions() is synchronous and
// idempotent, so it's safe to run at module load here.
registerWorkflowActions();

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [...inngestFunctions, ...workflowInngestFunctions, weeklyTrialBalanceReport],
});
