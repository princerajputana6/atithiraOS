"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Select, Field } from "@/components/ui";

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
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="min-w-[220px] flex-1">
        <Field label="Email">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
      </div>
      <div className="w-56">
        <Field label="Role">
          <Select value={roleKey} onChange={(e) => setRoleKey(e.target.value)}>
            <option value="business_admin">Business Administrator</option>
            <option value="department_manager">Department Manager</option>
            <option value="employee">Employee</option>
          </Select>
        </Field>
      </div>
      <Button type="submit" loading={loading}>
        Send invite
      </Button>
      {message && (
        <p className="w-full text-sm text-slate-500">{message}</p>
      )}
    </form>
  );
}
