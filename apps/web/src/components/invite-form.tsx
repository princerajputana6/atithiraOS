"use client";

import { useState, type FormEvent } from "react";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [roleKey, setRoleKey] = useState("employee");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/v1/identity/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, roleKey }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error ?? "Could not send invite");
      return;
    }
    setMessage(`Invite sent to ${email}`);
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">Role</label>
        <select
          value={roleKey}
          onChange={(e) => setRoleKey(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="business_admin">Business Administrator</option>
          <option value="department_manager">Department Manager</option>
          <option value="employee">Employee</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-gray-900 px-3 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send invite"}
      </button>
      {message && <p className="w-full text-sm text-gray-600">{message}</p>}
    </form>
  );
}
