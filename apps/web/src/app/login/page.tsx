"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthShell, AuthInput, AuthButton } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
  }

  function continueWithSso() {
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    window.location.href = `/api/auth/sso/start?email=${encodeURIComponent(email)}`;
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your Atithira workspace"
      footer={
        <a href="/forgot-password" className="hover:text-slate-200">
          Forgot password?
        </a>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <AuthInput
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          variant="auth"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <AuthButton type="submit" loading={loading}>
          Log in
        </AuthButton>
      </form>
      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <button
        type="button"
        onClick={continueWithSso}
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
      >
        Continue with SSO
      </button>
    </AuthShell>
  );
}
