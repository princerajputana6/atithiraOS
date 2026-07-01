import { TenantScopedRepository } from "@atithira/db";
import type { Collection } from "mongodb";
import type { BillingPayment, BillingPaymentStatus } from "@atithira/types";

/** Append-only ledger of Razorpay orders/payments for a tenant's subscription. */
export class BillingPaymentRepository extends TenantScopedRepository<BillingPayment> {
  protected readonly targetType = "billing_payment";

  constructor(collection: Collection<BillingPayment>) {
    super(collection);
  }

  list() {
    return this.find({});
  }

  findByRazorpayOrderId(razorpayOrderId: string) {
    return this.findOne({ razorpayOrderId } as never);
  }

  setStatus(
    razorpayOrderId: string,
    status: BillingPaymentStatus,
    razorpayPaymentId?: string,
  ) {
    return this.updateOne(
      { razorpayOrderId } as never,
      { $set: { status, ...(razorpayPaymentId ? { razorpayPaymentId } : {}) } },
      { action: `billing_payment.${status}` },
    );
  }
}
