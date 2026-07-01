"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Input,
  Field,
  Table,
  Th,
  Td,
  EmptyState,
} from "@/components/ui";

interface ApiKey {
  _id: string;
  name: string;
  prefix: string;
  createdAt: string;
}
interface Listing {
  _id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
}

export function DeveloperClient() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const [publish, setPublish] = useState({
    name: "",
    slug: "",
    description: "",
    priceMonthly: "0",
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const [kRes, lRes] = await Promise.all([
      fetch("/api/v1/developer/api-keys"),
      fetch("/api/v1/marketplace/my-listings"),
    ]);
    if (kRes.ok) setKeys((await kRes.json()).keys ?? []);
    if (lRes.ok) setListings((await lRes.json()).listings ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function createKey(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/v1/developer/api-keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
    });
    if (res.ok) {
      const data = await res.json();
      setRevealed(data.key);
      setNewKeyName("");
      await load();
    }
  }

  async function revoke(id: string) {
    await fetch(`/api/v1/developer/api-keys/${id}`, { method: "DELETE" });
    await load();
  }

  async function publishModule(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/v1/marketplace/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "module",
        name: publish.name,
        slug: publish.slug,
        description: publish.description,
        priceMonthly: Number(publish.priceMonthly),
        publisherName: "You",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error ?? "Publish failed");
      return;
    }
    setMsg(`Published "${publish.name}" to the marketplace.`);
    setPublish({ name: "", slug: "", description: "", priceMonthly: "0" });
    await load();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Developer"
        description="Build on Atithira — issue API keys and publish marketplace modules."
      />

      {/* API keys */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">API keys</h2>
        {revealed && (
          <Card className="mb-3 border-amber-200 bg-amber-50">
            <CardBody>
              <p className="text-sm font-medium text-amber-800">
                Copy this key now — it won't be shown again:
              </p>
              <code className="mt-1 block break-all rounded bg-white px-3 py-2 text-xs text-slate-800">
                {revealed}
              </code>
            </CardBody>
          </Card>
        )}
        <Card className="mb-3">
          <CardBody>
            <form onSubmit={createKey} className="flex items-end gap-3">
              <div className="flex-1">
                <Field label="Key name">
                  <Input
                    required
                    placeholder="e.g. CI pipeline"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </Field>
              </div>
              <Button type="submit">Generate key</Button>
            </form>
          </CardBody>
        </Card>
        {keys.length === 0 ? (
          <EmptyState title="No API keys yet" />
        ) : (
          <Table>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <Th>Name</Th>
                <Th>Prefix</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map((k) => (
                <tr key={k._id}>
                  <Td className="font-medium text-slate-900">{k.name}</Td>
                  <Td className="font-mono text-xs">{k.prefix}…</Td>
                  <Td>
                    <button
                      onClick={() => revoke(k._id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Revoke
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* SDK snippet */}
      <Card>
        <CardBody>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Publish with the SDK
          </h2>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
            {`import { AtithiraClient, defineModule } from "@atithira/sdk";

const client = new AtithiraClient({
  apiKey: process.env.ATITHIRA_API_KEY,   // atk_live_...
  publisherName: "Acme Labs",
});

const module = defineModule({
  slug: "acme-loyalty",
  name: "Acme Loyalty",
  description: "Reward repeat customers automatically.",
  priceMonthly: 299,
  subscribesTo: ["crm/deal.won"],
});

await client.publishModule(module);`}
          </pre>
        </CardBody>
      </Card>

      {/* Publish form */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Publish a module
        </h2>
        {msg && <p className="mb-3 text-sm text-emerald-600">{msg}</p>}
        <Card>
          <CardBody>
            <form
              onSubmit={publishModule}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <Field label="Module name">
                <Input
                  required
                  value={publish.name}
                  onChange={(e) =>
                    setPublish({ ...publish, name: e.target.value })
                  }
                />
              </Field>
              <Field label="Slug">
                <Input
                  required
                  value={publish.slug}
                  onChange={(e) =>
                    setPublish({ ...publish, slug: e.target.value })
                  }
                />
              </Field>
              <Field label="Description">
                <Input
                  required
                  value={publish.description}
                  onChange={(e) =>
                    setPublish({ ...publish, description: e.target.value })
                  }
                />
              </Field>
              <Field label="Price / month (₹)">
                <Input
                  type="number"
                  value={publish.priceMonthly}
                  onChange={(e) =>
                    setPublish({ ...publish, priceMonthly: e.target.value })
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit">Publish to marketplace</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {listings.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your published listings
            </h3>
            <Table>
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <Th>Name</Th>
                  <Th>Slug</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((l) => (
                  <tr key={l._id}>
                    <Td className="font-medium text-slate-900">{l.name}</Td>
                    <Td className="font-mono text-xs">{l.slug}</Td>
                    <Td className="capitalize">{l.status}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
