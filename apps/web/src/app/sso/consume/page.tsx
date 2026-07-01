"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthShell } from "@/components/auth-shell";

function ConsumeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ticket = params.get("ticket");
    if (!ticket) {
      setError("Missing SSO ticket.");
      return;
    }
    void (async () => {
      const result = await signIn("sso-ticket", { ticket, redirect: false });
      if (result?.error) {
        setError("This SSO sign-in link is invalid or has expired.");
        return;
      }
      router.push("/dashboard");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthShell title="Signing you in">
      <p className="text-sm text-slate-300">
        {error ?? "Completing your single sign-on…"}
      </p>
      {error && (
        <a href="/login" className="mt-3 inline-block text-indigo-300 hover:text-indigo-200">
          Back to log in
        </a>
      )}
    </AuthShell>
  );
}

export default function SsoConsumePage() {
  return (
    <Suspense>
      <ConsumeContent />
    </Suspense>
  );
}
