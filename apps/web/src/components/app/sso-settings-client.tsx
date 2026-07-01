"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Field,
  Badge,
} from "@/components/ui";

type Protocol = "oidc" | "saml";

interface SsoConfigForm {
  protocol: Protocol;
  enabled: boolean;
  emailDomains: string; // comma-separated in the form, array on the wire
  oidcIssuer: string;
  oidcClientId: string;
  oidcClientSecret: string;
  oidcClientSecretSet: boolean;
  samlEntryPoint: string;
  samlIssuer: string;
  samlCert: string;
}

const EMPTY: SsoConfigForm = {
  protocol: "oidc",
  enabled: false,
  emailDomains: "",
  oidcIssuer: "",
  oidcClientId: "",
  oidcClientSecret: "",
  oidcClientSecretSet: false,
  samlEntryPoint: "",
  samlIssuer: "",
  samlCert: "",
};

export function SsoSettingsClient() {
  const [form, setForm] = useState<SsoConfigForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/v1/identity/sso");
      if (!res.ok) return;
      const { config } = await res.json();
      if (!config) return;
      setForm({
        protocol: config.protocol,
        enabled: config.enabled,
        emailDomains: (config.emailDomains ?? []).join(", "),
        oidcIssuer: config.oidcIssuer ?? "",
        oidcClientId: config.oidcClientId ?? "",
        oidcClientSecret: "",
        oidcClientSecretSet: config.oidcClientSecretSet,
        samlEntryPoint: config.samlEntryPoint ?? "",
        samlIssuer: config.samlIssuer ?? "",
        samlCert: config.samlCert ?? "",
      });
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/v1/identity/sso", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        protocol: form.protocol,
        enabled: form.enabled,
        emailDomains: form.emailDomains
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
        oidcIssuer: form.oidcIssuer,
        oidcClientId: form.oidcClientId,
        oidcClientSecret: form.oidcClientSecret,
        samlEntryPoint: form.samlEntryPoint,
        samlIssuer: form.samlIssuer,
        samlCert: form.samlCert,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not save");
      return;
    }
    setMessage("SSO configuration saved.");
  }

  return (
    <div>
      <PageHeader
        title="Single Sign-On"
        description="Let your team log in with your identity provider (Okta, Azure AD, ADFS, and others) instead of a password."
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Field label="Protocol">
                <Select
                  value={form.protocol}
                  onChange={(e) =>
                    setForm({ ...form, protocol: e.target.value as Protocol })
                  }
                >
                  <option value="oidc">OIDC (OpenID Connect)</option>
                  <option value="saml">SAML 2.0</option>
                </Select>
              </Field>
              <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                />
                Enabled
              </label>
            </div>

            <Field label="Email domains (comma-separated) — logins from these domains route to your IdP">
              <Input
                required
                placeholder="acme.com, acme.io"
                value={form.emailDomains}
                onChange={(e) => setForm({ ...form, emailDomains: e.target.value })}
              />
            </Field>

            {form.protocol === "oidc" ? (
              <>
                <Field label="Issuer URL">
                  <Input
                    placeholder="https://your-tenant.okta.com"
                    value={form.oidcIssuer}
                    onChange={(e) => setForm({ ...form, oidcIssuer: e.target.value })}
                  />
                </Field>
                <Field label="Client ID">
                  <Input
                    value={form.oidcClientId}
                    onChange={(e) => setForm({ ...form, oidcClientId: e.target.value })}
                  />
                </Field>
                <Field
                  label={
                    form.oidcClientSecretSet
                      ? "Client secret (set — leave blank to keep it)"
                      : "Client secret"
                  }
                >
                  <Input
                    type="password"
                    value={form.oidcClientSecret}
                    onChange={(e) =>
                      setForm({ ...form, oidcClientSecret: e.target.value })
                    }
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="IdP SSO URL (entry point)">
                  <Input
                    placeholder="https://your-idp.com/sso/saml"
                    value={form.samlEntryPoint}
                    onChange={(e) => setForm({ ...form, samlEntryPoint: e.target.value })}
                  />
                </Field>
                <Field label="IdP entity ID (issuer)">
                  <Input
                    value={form.samlIssuer}
                    onChange={(e) => setForm({ ...form, samlIssuer: e.target.value })}
                  />
                </Field>
                <Field label="IdP signing certificate (PEM)">
                  <textarea
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    rows={6}
                    value={form.samlCert}
                    onChange={(e) => setForm({ ...form, samlCert: e.target.value })}
                  />
                </Field>
              </>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>
                Save
              </Button>
              {form.enabled && <Badge tone="green">Active</Badge>}
              {message && <span className="text-sm text-emerald-600">{message}</span>}
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
