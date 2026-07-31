import { config } from "@/lib/config";
import { RazorpayProvider } from "@/lib/payments/razorpay.provider";
import { StripeProvider } from "@/lib/payments/stripe.provider";
import type { PaymentProvider } from "@/lib/payments/types";

export function getPaymentProvider(): PaymentProvider {
  switch (config.paymentProvider.toLowerCase()) {
    case "stripe":
      return new StripeProvider();
    case "razorpay":
    default:
      return new RazorpayProvider();
  }
}
