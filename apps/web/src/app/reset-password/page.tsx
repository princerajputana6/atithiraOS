"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell, AuthInput, AuthButton } from "@/components/auth-shell";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/identity/password/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Reset failed");
      return;
    }
    router.push("/login");
  }

  return (
    <AuthShell
      title="Choose a new password"
      footer={
        <a href="/login" className="hover:text-slate-200">
          Back to log in
        </a>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <AuthInput
          type="password"
          required
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <AuthButton type="submit" loading={loading}>
          Save new password
        </AuthButton>
      </form>
    </AuthShell>
  );
}
