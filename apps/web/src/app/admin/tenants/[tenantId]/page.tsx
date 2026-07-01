import { TenantDetailClient } from "@/components/admin/tenant-detail-client";

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  return <TenantDetailClient tenantId={tenantId} />;
}
