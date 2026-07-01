import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "@atithira/config";
import { buildTenantSnapshot } from "./snapshot";

let client: Anthropic | undefined;

function getClient(): Anthropic | null {
  const env = getEnv();
  if (!env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

export function isCopilotConfigured(): boolean {
  return !!getEnv().ANTHROPIC_API_KEY;
}

/**
 * Answers a natural-language question about the tenant's business. The AI
 * Engine is a platform service: modules never call an LLM directly — they (or
 * the UI) go through this. It assembles a tenant-scoped data snapshot, hands it
 * to the model as grounded context, and returns the answer. Must run inside
 * runWithTenantContext for the asking tenant.
 */
export async function answerQuestion(question: string): Promise<string> {
  const anthropic = getClient();
  if (!anthropic) {
    return "The AI Copilot isn't configured yet. Add an ANTHROPIC_API_KEY to enable it — until then, the rest of Atithira works without any AI cost.";
  }

  const snapshot = await buildTenantSnapshot();
  const env = getEnv();

  const message = await anthropic.messages.create({
    model: env.AI_MODEL,
    max_tokens: 1024,
    system:
      "You are the Atithira Business OS Copilot. Answer the user's question using ONLY the JSON business data snapshot provided. Be concise and specific, use the actual numbers, and format currency in INR (₹). If the snapshot doesn't contain the answer, say so plainly and suggest which module would hold it. Do not invent data.",
    messages: [
      {
        role: "user",
        content: `Business data snapshot (JSON):\n${JSON.stringify(snapshot, null, 2)}\n\nQuestion: ${question}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text"
    ? textBlock.text
    : "I couldn't produce an answer.";
}
