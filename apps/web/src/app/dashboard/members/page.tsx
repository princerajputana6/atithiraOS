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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Members</h1>
      <InviteForm />
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Roles</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.userId} className="border-b">
              <td className="py-2">{member.name ?? "—"}</td>
              <td>{member.email}</td>
              <td>{member.status}</td>
              <td>{member.roles.join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
