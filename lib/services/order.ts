import { OrderStatus, PaymentProvider, PaymentStatus, ReservationStatus } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/format";
import {
  attachCouponHoldToOrder,
  calculateDiscount,
  consumeCouponForOrder,
  getActiveCouponHold,
} from "@/lib/services/coupon";
import { promoteReservationsToCheckout } from "@/lib/services/inventory";

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export async function initializeCheckout(input: {
  sessionId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress;
}) {
  const cartReservations = await prisma.stockReservation.findMany({
    where: {
      sessionId: input.sessionId,
      status: ReservationStatus.CART,
      expiresAt: { gt: new Date() },
    },
    include: { product: true },
  });

  if (cartReservations.length === 0) {
    throw new Error("Your bag is empty or reservations expired");
  }

  const subtotal = cartReservations.reduce<number>(
    (sum: number, item: (typeof cartReservations)[number]) => sum + item.product.price * item.quantity,
    0,
  );

  const couponHold = await getActiveCouponHold(input.sessionId);
  const discount = couponHold
    ? calculateDiscount(subtotal, couponHold.coupon.type, couponHold.coupon.value)
    : 0;
  const total = Math.max(0, subtotal - discount);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      shippingAddress: input.shippingAddress,
      sessionId: input.sessionId,
      subtotal,
      discount,
      total,
      status: OrderStatus.PENDING_PAYMENT,
      couponId: couponHold?.couponId,
    },
  });

  await promoteReservationsToCheckout(input.sessionId, order.id);
  await attachCouponHoldToOrder(input.sessionId, order.id);

  return prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: {
      items: true,
      coupon: true,
      stockReservations: { include: { product: true } },
    },
  });
}

export async function createOrderItemsFromReservations(orderId: string) {
  const reservations = await prisma.stockReservation.findMany({
    where: {
      orderId,
      status: ReservationStatus.CHECKOUT,
      expiresAt: { gt: new Date() },
    },
    include: { product: true },
  });

  if (reservations.length === 0) {
    throw new Error("Checkout reservations expired");
  }

  await prisma.orderItem.createMany({
    data: reservations.map((reservation: (typeof reservations)[number]) => ({
      orderId,
      productId: reservation.productId,
      productName: reservation.product.name,
      productPrice: reservation.product.price,
      quantity: reservation.quantity,
    })),
  });
}

export async function finalizePaidOrder(
  orderId: string,
  paymentData: {
    provider: PaymentProvider;
    externalId: string;
    amount: number;
    metadata?: Record<string, unknown>;
  },
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payments: true,
      items: true,
      stockReservations: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    return prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        items: true,
        coupon: true,
        shippingUpdates: true,
        payments: true,
      },
    });
  }

  const activeReservations = order.stockReservations.filter(
    (reservation: (typeof order.stockReservations)[number]) =>
      reservation.status === ReservationStatus.CHECKOUT &&
      reservation.expiresAt > new Date(),
  );

  if (activeReservations.length === 0) {
    throw new Error("Checkout reservations expired");
  }

  if (order.items.length === 0) {
    await createOrderItemsFromReservations(orderId);
  }

  const { convertReservationsForOrder } = await import(
    "@/lib/services/inventory"
  );
  await convertReservationsForOrder(orderId);
  await consumeCouponForOrder(orderId);

  const updatedOrder = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.payment.create({
      data: {
        orderId,
        provider: paymentData.provider,
        externalId: paymentData.externalId,
        amount: paymentData.amount,
        status: PaymentStatus.SUCCESS,
        metadata: (paymentData.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    return tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PROCESSING },
      include: {
        items: true,
        coupon: true,
        shippingUpdates: true,
        payments: true,
      },
    });
  });

  await prisma.shippingUpdate.create({
    data: {
      orderId,
      status: OrderStatus.PROCESSING,
      note: "Payment received. Order is being prepared.",
    },
  });

  const { sendOrderConfirmation } = await import(
    "@/lib/notifications/service"
  );
  await sendOrderConfirmation(updatedOrder.id);

  return updatedOrder;
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      coupon: true,
      shippingUpdates: { orderBy: { createdAt: "asc" } },
      payments: true,
    },
  });
}

export async function listOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      items: true,
      coupon: true,
      shippingUpdates: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateShippingProgress(input: {
  orderId: string;
  status: OrderStatus;
  note?: string;
}) {
  const order = await prisma.order.update({
    where: { id: input.orderId },
    data: { status: input.status },
  });

  await prisma.shippingUpdate.create({
    data: {
      orderId: input.orderId,
      status: input.status,
      note: input.note,
    },
  });

  if (input.status === OrderStatus.SHIPPED) {
    const { sendShippingUpdate } = await import("@/lib/notifications/service");
    await sendShippingUpdate(order.id, input.note);
  }

  return order;
}
