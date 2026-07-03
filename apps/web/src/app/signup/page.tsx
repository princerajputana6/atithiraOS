import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      title="Workspace creation is request-only"
      subtitle="Tell us which services you want to use and our team will help configure your workspace."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-brand-700 hover:text-brand-800">
            Log in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Link
          href="/#request"
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700"
        >
          Request services
        </Link>
        <p className="text-center text-xs leading-relaxed text-slate-500">
          Public signup is disabled so no workspace is created before a service
          request is reviewed.
        </p>
      </div>
    </AuthShell>
  );
}
