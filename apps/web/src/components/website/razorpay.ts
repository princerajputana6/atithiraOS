"use client";

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (res: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

let loadPromise: Promise<boolean> | null = null;

/** Lazily injects the Razorpay Checkout script; resolves false if it can't load. */
export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return loadPromise;
}

export interface PaymentIntent {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

/**
 * Opens Razorpay Checkout for a payment intent and resolves with the handshake
 * fields on success (to be re-verified server-side), or null if the visitor
 * dismisses the modal / the script fails to load.
 */
export async function payWithRazorpay(args: {
  intent: PaymentIntent;
  businessName: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
}): Promise<{ razorpayOrderId: string; razorpayPaymentId: string; signature: string } | null> {
  const loaded = await loadRazorpay();
  if (!loaded || !window.Razorpay) return null;
  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: args.intent.keyId,
      amount: args.intent.amountPaise,
      currency: args.intent.currency,
      name: args.businessName,
      description: args.description,
      order_id: args.intent.orderId,
      prefill: args.prefill,
      theme: { color: "#4f46e5" },
      handler: (res) =>
        resolve({
          razorpayOrderId: res.razorpay_order_id,
          razorpayPaymentId: res.razorpay_payment_id,
          signature: res.razorpay_signature,
        }),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.open();
  });
}
