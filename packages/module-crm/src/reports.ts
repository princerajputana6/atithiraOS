import { registerReport } from "@atithira/core-reporting";
import { listDeals } from "./services";

registerReport({
  key: "pipeline",
  name: "Sales Pipeline",
  description: "Open deal value grouped by stage.",
  run: async () => {
    const deals = await listDeals();
    const byStage = new Map<string, { count: number; amount: number }>();
    for (const deal of deals) {
      const bucket = byStage.get(deal.stage) ?? { count: 0, amount: 0 };
      bucket.count += 1;
      bucket.amount += deal.amount;
      byStage.set(deal.stage, bucket);
    }
    return [...byStage.entries()].map(([stage, { count, amount }]) => ({
      stage,
      count,
      amount,
    }));
  },
});
