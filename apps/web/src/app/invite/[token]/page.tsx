"use client";

import { use, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, AuthInput, AuthButton } from "@/components/auth-shell";

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/identity/invite/accept", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, name, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not accept invite");
      return;
    }
    router.push("/login");
  }

  return (
    <AuthShell
      title="Accept your invite"
      subtitle="Set your name and a password to join the workspace"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <AuthInput
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <AuthInput
          required
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <AuthButton type="submit" loading={loading}>
          Join workspace
        </AuthButton>
      </form>
    </AuthShell>
  );
}
