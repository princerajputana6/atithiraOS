import { PERMISSIONS } from "@atithira/core-security";
import {
  getTenantPaymentInfo,
  setTenantPaymentConfig,
  setTenantPaymentEnabled,
  disconnectTenantPayment,
} from "@atithira/core-tenancy";
import { tenantApi } from "@/lib/api";

/** Read the tenant's (non-secret) payment-gateway status. */
export async function GET() {
  return tenantApi(PERMISSIONS.TENANCY_CONFIG_MANAGE, async () => {
    return { config: await getTenantPaymentInfo() };
  });
}

/** Save the tenant's own Razorpay keys (secret encrypted at rest). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApi(PERMISSIONS.TENANCY_CONFIG_MANAGE, async () => {
    const keyId = typeof body.keyId === "string" ? body.keyId.trim() : "";
    const keySecret = typeof body.keySecret === "string" ? body.keySecret.trim() : "";
    if (!keyId) throw new Error("Key ID is required");
    if (!keySecret) throw new Error("Key secret is required");
    await setTenantPaymentConfig({
      provider: "razorpay",
      keyId,
      keySecret,
      enabled: body.enabled === undefined ? true : !!body.enabled,
    });
    return { config: await getTenantPaymentInfo() };
  });
}

/** Toggle online payments on/off without re-entering keys. */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApi(PERMISSIONS.TENANCY_CONFIG_MANAGE, async () => {
    await setTenantPaymentEnabled(!!body.enabled);
    return { config: await getTenantPaymentInfo() };
  });
}

/** Remove the tenant's stored gateway credentials entirely. */
export async function DELETE() {
  return tenantApi(PERMISSIONS.TENANCY_CONFIG_MANAGE, async () => {
    await disconnectTenantPayment();
    return { config: await getTenantPaymentInfo() };
  });
}
