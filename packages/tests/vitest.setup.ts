import { beforeAll, afterAll, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

// Dummy values for everything that isn't actually exercised over the network
// in these tests — real service calls (Resend, Inngest) are mocked below.
process.env.AUTH_SECRET = "test-secret-not-for-production-use-only";
process.env.MFA_ENCRYPTION_KEY = "0".repeat(64);
process.env.RESEND_API_KEY = "test-resend-key";
process.env.RESEND_FROM_EMAIL = "test@example.com";
process.env.IMAGEKIT_PUBLIC_KEY = "test-public";
process.env.IMAGEKIT_PRIVATE_KEY = "test-private";
process.env.IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/test";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: vi.fn().mockResolvedValue({ data: { id: "test-email-id" }, error: null }),
    };
  },
}));

// vi.mock("inngest", ...) doesn't reliably intercept the real, published
// "inngest" package here (it's loaded as a pre-built external dependency,
// bypassing Vitest's mock resolution however deps.inline is configured).
// Mocking our own @atithira/core-events instead is reliable, since it's
// resolved straight to raw TS source and always goes through the transform
// graph — and it's the actual seam other packages import through anyway.
vi.mock("@atithira/core-events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
  inngest: {},
  inngestFunctions: [],
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  // Set before any application code calls getEnv()/getDb() for the first
  // time — both cache on first read, so ordering here matters.
  process.env.MONGODB_URI = mongoServer.getUri("atithira_test");

  // In the real app this happens once in instrumentation.ts at boot; tests
  // need it too, or every TenantScopedRepository write silently skips
  // audit logging (the hook defaults to a no-op until registered).
  const { installAuditHook } = await import("@atithira/core-security");
  installAuditHook();
}, 60000);

afterAll(async () => {
  await mongoServer?.stop();
});
