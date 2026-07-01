"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui";
import type { PlanKey } from "@atithira/types";
// The `Window.Razorpay` global is declared once in components/website/razorpay.ts
// and merges program-wide, so we reuse that strict type here.

export function UpgradeButton({
  planKey,
  planName,
  configured,
}: {
  planKey: PlanKey;
  planName: string;
  configured: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout");

      if (!window.Razorpay) throw new Error("Payment library failed to load");
      const razorpay = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amountPaise,
        currency: data.currency,
        name: "Atithira Business OS",
        description: `Upgrade to ${planName}`,
        handler: () => {
          // Activation is driven by the server-verified webhook, not this
          // callback — reload to reflect the plan once it lands.
          window.location.reload();
        },
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <Button variant="secondary" disabled className="w-full">
        Payment gateway not configured
      </Button>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Button onClick={upgrade} loading={loading} className="w-full">
        Upgrade to {planName}
      </Button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </>
  );
}
