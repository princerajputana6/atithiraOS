export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-8 flex gap-6 text-sm font-medium text-gray-600">
        <a href="/dashboard">Dashboard</a>
        <a href="/dashboard/members">Members</a>
      </nav>
      {children}
    </div>
  );
}
