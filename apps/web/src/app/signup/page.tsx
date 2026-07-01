"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, AuthInput, AuthButton } from "@/components/auth-shell";

interface SignupForm {
  organizationName: string;
  slug: string;
  name: string;
  email: string;
  password: string;
}

const initialForm: SignupForm = {
  organizationName: "",
  slug: "",
  name: "",
  email: "",
  password: "",
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof SignupForm) {
    return (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/identity/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Signup failed");
      return;
    }
    router.push("/verify-email?pending=1");
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Set up your business on Atithira in minutes"
      footer={
        <>
          Already have an account?{" "}
          <a href="/login" className="text-slate-200 hover:text-white">
            Log in
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <AuthInput
          required
          placeholder="Organization name"
          value={form.organizationName}
          onChange={update("organizationName")}
        />
        <AuthInput
          required
          placeholder="Workspace URL slug (e.g. acme)"
          value={form.slug}
          onChange={update("slug")}
        />
        <AuthInput
          required
          placeholder="Your name"
          value={form.name}
          onChange={update("name")}
        />
        <AuthInput
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update("email")}
        />
        <AuthInput
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={update("password")}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <AuthButton type="submit" loading={loading}>
          Create workspace
        </AuthButton>
      </form>
    </AuthShell>
  );
}
