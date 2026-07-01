"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Create your workspace</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          placeholder="Organization name"
          value={form.organizationName}
          onChange={update("organizationName")}
          className="rounded border px-3 py-2"
        />
        <input
          required
          placeholder="Workspace URL slug (e.g. acme)"
          value={form.slug}
          onChange={update("slug")}
          className="rounded border px-3 py-2"
        />
        <input
          required
          placeholder="Your name"
          value={form.name}
          onChange={update("name")}
          className="rounded border px-3 py-2"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update("email")}
          className="rounded border px-3 py-2"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={update("password")}
          className="rounded border px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create workspace"}
        </button>
      </form>
      <a href="/login" className="text-sm text-gray-600">
        Already have an account? Log in
      </a>
    </main>
  );
}
