"use client";

import { useState, type FormEvent } from "react";
import { AuthShell, AuthInput, AuthButton } from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/v1/identity/password/reset-request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle={
        submitted ? undefined : "We'll email you a link to reset it"
      }
      footer={
        <a href="/login" className="hover:text-slate-200">
          Back to log in
        </a>
      }
    >
      {submitted ? (
        <p className="text-center text-sm text-slate-300">
          If that email has an account, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <AuthInput
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthButton type="submit" loading={loading}>
            Send reset link
          </AuthButton>
        </form>
      )}
    </AuthShell>
  );
}
