import type { TenantLifecycleState } from "@atithira/types";
import { getOrganizationRepository } from "../collections";

export async function transitionTenantStatus(
  tenantId: string,
  status: TenantLifecycleState,
): Promise<void> {
  const orgRepo = await getOrganizationRepository();
  await orgRepo.updateStatus(tenantId, status);
}
