import { PaymentProvider as PaymentProviderEnum } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { getPaymentProvider } from "@/lib/payments/factory";
import {
  createOrderItemsFromReservations,
  finalizePaidOrder,
} from "@/lib/services/order";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  providerOrderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING_PAYMENT" && order.status !== "PROCESSING") {
      return NextResponse.json({ order });
    }

    const provider = getPaymentProvider();
    const verification = await provider.verifyPayment({
      orderId: order.id,
      providerOrderId: body.providerOrderId,
      paymentId: body.paymentId,
      signature: body.signature,
      amount: order.total,
    });

    if (!verification.success) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    if (order.items.length === 0) {
      await createOrderItemsFromReservations(order.id);
    }

    const paymentProviderEnum =
      provider.name === "stripe"
        ? PaymentProviderEnum.STRIPE
        : PaymentProviderEnum.RAZORPAY;

    const updatedOrder = await finalizePaidOrder(order.id, {
      provider: paymentProviderEnum,
      externalId: verification.paymentId,
      amount: order.total,
      metadata: verification.metadata,
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    return handleApiError(error);
  }
}
