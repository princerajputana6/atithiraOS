"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const pending = params.get("pending");
  const [status, setStatus] = useState<"idle" | "verifying" | "done" | "error">(
    token ? "verifying" : "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/v1/identity/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Verification failed");
          setStatus("error");
          return;
        }
        setStatus("done");
      })
      .catch(() => {
        setError("Verification failed");
        setStatus("error");
      });
  }, [token]);

  return (
    <AuthShell title="Verify your email">
      <div className="text-center text-sm text-slate-300">
        {status === "idle" && pending && (
          <p>Check your email for a verification link before logging in.</p>
        )}
        {status === "verifying" && <p>Verifying your email…</p>}
        {status === "done" && (
          <div className="flex flex-col gap-3">
            <p>Your email is verified.</p>
            <a href="/login" className="text-indigo-300 hover:text-indigo-200">
              Log in
            </a>
          </div>
        )}
        {status === "error" && <p className="text-red-400">{error}</p>}
      </div>
    </AuthShell>
  );
}
