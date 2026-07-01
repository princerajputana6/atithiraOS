"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4 text-center">
      {status === "idle" && pending && (
        <p>Check your email for a verification link before logging in.</p>
      )}
      {status === "verifying" && <p>Verifying your email…</p>}
      {status === "done" && (
        <>
          <p>Your email is verified.</p>
          <a href="/login" className="text-blue-600 underline">
            Log in
          </a>
        </>
      )}
      {status === "error" && <p className="text-red-600">{error}</p>}
    </main>
  );
}
