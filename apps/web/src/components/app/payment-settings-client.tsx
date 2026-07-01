"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Input,
  Field,
  Badge,
} from "@/components/ui";

interface PaymentInfo {
  connected: boolean;
  provider: string | null;
  keyId: string | null;
  enabled: boolean;
}

export function PaymentSettingsClient() {
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/payments/config");
    if (!res.ok) return;
    const { config } = await res.json();
    setInfo(config);
    setKeyId(config?.keyId ?? "");
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/v1/payments/config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ keyId, keySecret, enabled: true }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not save");
      return;
    }
    const { config } = await res.json();
    setInfo(config);
    setKeySecret("");
    setMessage("Razorpay connected. Your website can now take online payments.");
  }

  async function toggleEnabled(enabled: boolean) {
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/v1/payments/config", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not update");
      return;
    }
    setInfo((await res.json()).config);
  }

  async function disconnect() {
    if (!confirm("Remove your Razorpay keys? Your website will fall back to pay-offline.")) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/v1/payments/config", { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not disconnect");
      return;
    }
    setInfo((await res.json()).config);
    setKeyId("");
    setKeySecret("");
    setMessage("Razorpay disconnected.");
  }

  return (
    <div>
      <PageHeader
        title="Payment Gateway"
        description="Connect your own Razorpay account so online payments from your website — appointments, food orders, bookings — settle directly into your bank."
      />

      {info?.connected && (
        <Card className="mb-4">
          <CardBody>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">Razorpay</span>
                  {info.enabled ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="amber">Paused</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Key ID <span className="font-mono">{info.keyId}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  loading={busy}
                  onClick={() => toggleEnabled(!info.enabled)}
                >
                  {info.enabled ? "Pause" : "Resume"}
                </Button>
                <Button variant="danger" loading={busy} onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Find these in your{" "}
              <a
                href="https://dashboard.razorpay.com/app/keys"
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 underline"
              >
                Razorpay dashboard → Settings → API Keys
              </a>
              . We encrypt your secret key and never show it again.
            </p>

            <Field label="Key ID">
              <Input
                required
                placeholder="rzp_live_xxxxxxxx"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
              />
            </Field>

            <Field
              label={
                info?.connected
                  ? "Key secret (stored — enter again to replace)"
                  : "Key secret"
              }
            >
              <Input
                type="password"
                required={!info?.connected}
                placeholder="••••••••••••••••"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
              />
            </Field>

            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>
                {info?.connected ? "Update keys" : "Connect Razorpay"}
              </Button>
              {message && <span className="text-sm text-emerald-600">{message}</span>}
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
