import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { getPaymentProvider } from "@/lib/payments/factory";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const order = await prisma.order.findUnique({ where: { id: body.orderId } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ error: "Order is not pending payment" }, { status: 400 });
    }

    const provider = getPaymentProvider();
    const paymentOrder = await provider.createOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
    });

    return NextResponse.json({ paymentOrder, provider: provider.name });
  } catch (error) {
    return handleApiError(error);
  }
}
