import { randomUUID } from "crypto";
import { config } from "@/lib/config";
import type {
  CreatePaymentOrderInput,
  PaymentOrder,
  PaymentProvider,
  VerifyPaymentInput,
  PaymentVerification,
} from "@/lib/payments/types";

export class RazorpayProvider implements PaymentProvider {
  readonly name = "razorpay" as const;

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    return {
      providerOrderId: `order_${randomUUID().replace(/-/g, "").slice(0, 14)}`,
      amount: input.amount,
      currency: "INR",
      keyId: config.razorpay.keyId,
      metadata: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        mode: "dummy",
      },
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerification> {
    const isValid =
      input.signature === "dummy_ok" ||
      input.signature === `dummy_${input.paymentId}`;

    if (!isValid) {
      return {
        success: false,
        paymentId: input.paymentId,
        providerOrderId: input.providerOrderId,
      };
    }

    if (input.amount <= 0) {
      return {
        success: false,
        paymentId: input.paymentId,
        providerOrderId: input.providerOrderId,
      };
    }

    return {
      success: true,
      paymentId: input.paymentId,
      providerOrderId: input.providerOrderId,
      metadata: {
        verifiedAt: new Date().toISOString(),
        mode: "dummy",
      },
    };
  }
}
