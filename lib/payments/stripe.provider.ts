import type {
  CreatePaymentOrderInput,
  PaymentOrder,
  PaymentProvider,
  VerifyPaymentInput,
  PaymentVerification,
} from "@/lib/payments/types";

export class StripeProvider implements PaymentProvider {
  readonly name = "stripe" as const;

  async createOrder(_input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    throw new Error(
      "StripeProvider is not implemented yet. Set PAYMENT_PROVIDER=razorpay or implement StripeProvider.",
    );
  }

  async verifyPayment(_input: VerifyPaymentInput): Promise<PaymentVerification> {
    throw new Error(
      "StripeProvider is not implemented yet. Set PAYMENT_PROVIDER=razorpay or implement StripeProvider.",
    );
  }
}
