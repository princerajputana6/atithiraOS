"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, CardBody, Button, Badge } from "@/components/ui";

interface Listing {
  _id: string;
  type: string;
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  currency: string;
  publisherName: string;
}
interface Installation {
  _id: string;
  listingSlug: string;
}

const TYPE_TONE: Record<string, "purple" | "blue" | "amber" | "green" | "gray"> =
  {
    module: "purple",
    integration: "blue",
    ai: "amber",
    theme: "green",
    workflow: "gray",
  };

export function MarketplaceClient() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const [lRes, iRes] = await Promise.all([
      fetch("/api/v1/marketplace/listings"),
      fetch("/api/v1/marketplace/installations"),
    ]);
    if (lRes.ok) setListings((await lRes.json()).listings ?? []);
    if (iRes.ok) {
      const items: Installation[] = (await iRes.json()).installations ?? [];
      setInstalled(new Set(items.map((i) => i.listingSlug)));
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function install(listing: Listing) {
    setMsg(null);
    const res = await fetch("/api/v1/marketplace/installations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId: listing._id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error ?? "Install failed");
      return;
    }
    if (data.charge) {
      setMsg(
        `Installed ${listing.name}. Billed ${listing.currency} ${data.charge.amount} (platform fee ${listing.currency} ${data.charge.platformFee}).`,
      );
    } else {
      setMsg(`Installed ${listing.name} (free).`);
    }
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Marketplace"
        description="Extend Atithira with modules, integrations, AI agents, themes, and workflows."
      />
      {msg && <p className="mb-4 text-sm text-emerald-600">{msg}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => {
          const isInstalled = installed.has(l.slug);
          return (
            <Card key={l._id}>
              <CardBody className="flex h-full flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <Badge tone={TYPE_TONE[l.type] ?? "gray"}>{l.type}</Badge>
                  <span className="text-sm font-medium text-slate-700">
                    {l.priceMonthly > 0
                      ? `${l.currency} ${l.priceMonthly}/mo`
                      : "Free"}
                  </span>
                </div>
                <p className="text-base font-semibold text-slate-900">{l.name}</p>
                <p className="mt-1 flex-1 text-sm text-slate-500">
                  {l.description}
                </p>
                <p className="mt-2 text-xs text-slate-400">by {l.publisherName}</p>
                <div className="mt-3">
                  {isInstalled ? (
                    <Badge tone="green">Installed</Badge>
                  ) : (
                    <Button variant="secondary" onClick={() => install(l)}>
                      Install
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
