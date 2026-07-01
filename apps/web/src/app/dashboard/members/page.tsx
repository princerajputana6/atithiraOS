import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import { getUserRepository } from "@atithira/core-identity";
import {
  getActiveTenantIdForUser,
  getMembershipRepository,
} from "@atithira/core-tenancy";
import { getRolesForUser } from "@atithira/core-security";
import { runWithTenantContext } from "@atithira/db";
import { InviteForm } from "@/components/invite-form";
import { PageHeader, Card, CardBody, Table, Th, Td, Badge } from "@/components/ui";
import { ensureBootstrapped } from "@/lib/bootstrap";

export default async function MembersPage() {
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  const members = await runWithTenantContext(
    { tenantId, userId: session.user.id },
    async () => {
      const membershipRepo = await getMembershipRepository();
      const memberships = await membershipRepo.listMembers();
      const userRepo = await getUserRepository();

      return Promise.all(
        memberships.map(async (membership) => {
          const user = await userRepo.findById(membership.userId);
          const roles = await getRolesForUser(membership.userId);
          return {
            userId: membership.userId,
            email: user?.email,
            name: user?.name,
            status: membership.status,
            roles: roles.map((role) => role.name),
          };
        }),
      );
    },
  );

  return (
    <div>
      <PageHeader
        title="Members"
        description="Invite teammates and manage their roles."
      />

      <Card className="mb-6">
        <CardBody>
          <InviteForm />
        </CardBody>
      </Card>

      <Table>
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th>Roles</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.map((member) => (
            <tr key={member.userId}>
              <Td className="font-medium text-slate-900">
                {member.name ?? "—"}
              </Td>
              <Td>{member.email}</Td>
              <Td>
                <Badge tone={member.status === "active" ? "green" : "amber"}>
                  {member.status}
                </Badge>
              </Td>
              <Td>{member.roles.join(", ") || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
