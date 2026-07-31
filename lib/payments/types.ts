export type CreatePaymentOrderInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerEmail: string;
  customerName: string;
};

export type PaymentOrder = {
  providerOrderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  metadata?: Record<string, unknown>;
};

export type VerifyPaymentInput = {
  orderId: string;
  providerOrderId: string;
  paymentId: string;
  signature: string;
  amount: number;
};

export type PaymentVerification = {
  success: boolean;
  paymentId: string;
  providerOrderId: string;
  metadata?: Record<string, unknown>;
};

export interface PaymentProvider {
  readonly name: "razorpay" | "stripe";
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>;
  verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerification>;
}
