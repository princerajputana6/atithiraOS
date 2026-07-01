import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_URI_TEST: z.string().optional(),

  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().url().default("http://localhost:3000"),

  MFA_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-f]{64}$/i, "MFA_ENCRYPTION_KEY must be a 32-byte hex string"),

  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_FROM_EMAIL: z.string().email(),

  IMAGEKIT_PUBLIC_KEY: z.string().min(1),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),

  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // AI Copilot — optional so the ₹0 setup runs without it. When unset, the
  // Copilot returns a graceful "not configured" message instead of erroring.
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default("claude-haiku-4-5"),

  // Razorpay — optional so the ₹0 setup runs without it. When unset, checkout
  // returns a graceful "payment gateway not configured" error instead of
  // crashing, same pattern as the AI Copilot above.
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Root domain tenant sites are hosted under, e.g. "atithira.com" — a
  // published page then becomes reachable at "{tenantSlug}.atithira.com" once
  // wildcard DNS + a wildcard TLS cert point at this app. Optional: unset
  // means tenant sites are only reachable at the in-app "/site/{slug}" path
  // (fine for local dev, or before DNS is configured). See middleware.ts.
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().optional(),

  // Observability — optional so the ₹0 setup runs without a collector.
  // When OTEL_EXPORTER_OTLP_ENDPOINT is unset, traces export to the console
  // instead of failing; see core-observability/src/tracing.ts.
  LOG_LEVEL: z.string().default("info"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

/**
 * Validates process.env once and caches the result. Called at app boot so
 * misconfiguration fails fast instead of surfacing as a confusing runtime error
 * deep inside a request handler.
 */
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}
