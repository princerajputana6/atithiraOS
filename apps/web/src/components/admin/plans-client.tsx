"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { AdminPageHeader, adminCurrency } from "@/components/admin/admin-ui";

interface Plan {
  key: string;
  name: string;
  priceMonthly: number;
  limits: Record<string, number>;
  features: string[];
}

export function PlansClient() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/v1/admin/plans");
      if (res.ok) setPlans((await res.json()).plans ?? []);
    })();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Plans"
        description="The subscription tiers offered across the platform."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.key}>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {plan.name}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {plan.priceMonthly > 0 ? `${adminCurrency.format(plan.priceMonthly)}/mo` : "Free"}
            </p>
            <div className="mt-4 flex flex-col gap-1 text-sm text-slate-400">
              {Object.entries(plan.limits).map(([k, v]) => (
                <span key={k} className="capitalize">
                  {k}: {v === Number.POSITIVE_INFINITY || v > 1e6 ? "Unlimited" : v}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
