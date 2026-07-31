import { Prisma, ReservationStatus } from "@/lib/generated/prisma";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { OutOfStockError } from "@/lib/errors";

type TransactionClient = Prisma.TransactionClient;

const ACTIVE_STATUSES: ReservationStatus[] = [
  ReservationStatus.CART,
  ReservationStatus.CHECKOUT,
];

export async function sumActiveReservations(
  tx: TransactionClient,
  productId: string,
  excludeSessionId?: string,
): Promise<number> {
  const result = await tx.stockReservation.aggregate({
    where: {
      productId,
      status: { in: ACTIVE_STATUSES },
      expiresAt: { gt: new Date() },
      ...(excludeSessionId ? { NOT: { sessionId: excludeSessionId } } : {}),
    },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

async function lockProduct(tx: TransactionClient, productId: string) {
  const rows = await tx.$queryRaw<Array<{ id: string; stockQuantity: number }>>`
    SELECT id, "stockQuantity"
    FROM "Product"
    WHERE id = ${productId}
    FOR UPDATE
  `;
  const product = rows[0];
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
}

export async function getAvailableStock(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stockQuantity: true },
  });
  if (!product) return 0;

  const reserved = await sumActiveReservations(prisma, productId);
  return Math.max(0, product.stockQuantity - reserved);
}

export async function reserveForCart(
  productId: string,
  quantity: number,
  sessionId: string,
) {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  return prisma.$transaction(async (tx: TransactionClient) => {
    const product = await lockProduct(tx, productId);
    if (!product) throw new Error("Product not found");

    const otherReserved = await sumActiveReservations(tx, productId, sessionId);
    const existing = await tx.stockReservation.findFirst({
      where: {
        productId,
        sessionId,
        status: ReservationStatus.CART,
        expiresAt: { gt: new Date() },
      },
    });

    const currentQty = existing?.quantity ?? 0;
    const newQty = existing ? currentQty + quantity : quantity;
    const totalReserved = otherReserved + newQty;

    if (product.stockQuantity < totalReserved) {
      throw new OutOfStockError();
    }

    const expiresAt = new Date(
      Date.now() + config.cartReservationTtlMinutes * 60 * 1000,
    );

    if (existing) {
      return tx.stockReservation.update({
        where: { id: existing.id },
        data: { quantity: newQty, expiresAt },
        include: { product: true },
      });
    }

    return tx.stockReservation.create({
      data: {
        productId,
        sessionId,
        quantity,
        status: ReservationStatus.CART,
        expiresAt,
      },
      include: { product: true },
    });
  });
}

export async function updateCartReservation(
  reservationId: string,
  quantity: number,
  sessionId: string,
) {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  return prisma.$transaction(async (tx: TransactionClient) => {
    const reservation = await tx.stockReservation.findFirst({
      where: {
        id: reservationId,
        sessionId,
        status: ReservationStatus.CART,
        expiresAt: { gt: new Date() },
      },
    });
    if (!reservation) {
      throw new Error("Reservation not found or expired");
    }

    const product = await lockProduct(tx, reservation.productId);
    const otherReserved = await sumActiveReservations(
      tx,
      reservation.productId,
      sessionId,
    );

    if (product.stockQuantity < otherReserved + quantity) {
      throw new OutOfStockError();
    }

    return tx.stockReservation.update({
      where: { id: reservationId },
      data: {
        quantity,
        expiresAt: new Date(
          Date.now() + config.cartReservationTtlMinutes * 60 * 1000,
        ),
      },
      include: { product: true },
    });
  });
}

export async function releaseReservation(
  reservationId: string,
  sessionId: string,
) {
  return prisma.stockReservation.updateMany({
    where: {
      id: reservationId,
      sessionId,
      status: { in: [ReservationStatus.CART, ReservationStatus.CHECKOUT] },
    },
    data: { status: ReservationStatus.RELEASED },
  });
}

export async function promoteReservationsToCheckout(
  sessionId: string,
  orderId: string,
) {
  const expiresAt = new Date(
    Date.now() + config.checkoutReservationTtlMinutes * 60 * 1000,
  );

  const reservations = await prisma.stockReservation.findMany({
    where: {
      sessionId,
      status: ReservationStatus.CART,
      expiresAt: { gt: new Date() },
    },
    include: { product: true },
  });

  if (reservations.length === 0) {
    throw new Error("No active cart reservations found");
  }

  await prisma.stockReservation.updateMany({
    where: {
      id: { in: reservations.map((r: (typeof reservations)[number]) => r.id) },
    },
    data: {
      status: ReservationStatus.CHECKOUT,
      orderId,
      expiresAt,
    },
  });

  return reservations;
}

export async function convertReservationsForOrder(orderId: string) {
  const reservations = await prisma.stockReservation.findMany({
    where: {
      orderId,
      status: ReservationStatus.CHECKOUT,
      expiresAt: { gt: new Date() },
    },
  });

  return prisma.$transaction(async (tx: TransactionClient) => {
    for (const reservation of reservations) {
      await lockProduct(tx, reservation.productId);
      await tx.product.update({
        where: { id: reservation.productId },
        data: { stockQuantity: { decrement: reservation.quantity } },
      });
      await tx.stockReservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.CONVERTED },
      });
    }
  });
}

export async function releaseExpiredReservations() {
  const now = new Date();

  const stockResult = await prisma.stockReservation.updateMany({
    where: {
      status: { in: [ReservationStatus.CART, ReservationStatus.CHECKOUT] },
      expiresAt: { lte: now },
    },
    data: { status: ReservationStatus.RELEASED },
  });

  const couponResult = await prisma.couponReservation.updateMany({
    where: {
      status: "HELD",
      expiresAt: { lte: now },
    },
    data: { status: "RELEASED" },
  });

  return {
    stockReleased: stockResult.count,
    couponReleased: couponResult.count,
  };
}
