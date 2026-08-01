import { ReservationStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/db";
import {
  getAvailableStock,
  releaseReservation,
  reserveForCart,
  updateCartReservation,
} from "@/lib/services/inventory";

export async function getCart(sessionId: string) {
  const reservations = await prisma.stockReservation.findMany({
    where: {
      sessionId,
      status: ReservationStatus.CART,
      expiresAt: { gt: new Date() },
    },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  const subtotal = reservations.reduce<number>(
    (sum: number, item: (typeof reservations)[number]) => sum + item.product.price * item.quantity,
    0,
  );

  const earliestExpiry = reservations.reduce<Date | null>((earliest: Date | null, item: (typeof reservations)[number]) => {
    if (!earliest || item.expiresAt < earliest) return item.expiresAt;
    return earliest;
  }, null);

  return { items: reservations, subtotal, earliestExpiry };
}

export async function addToCart(
  sessionId: string,
  productId: string,
  quantity: number,
) {
  const product = await prisma.product.findFirst({
    where: { id: productId, active: true },
  });
  if (!product) {
    throw new Error("Product not found");
  }

  const reservation = await reserveForCart(productId, quantity, sessionId);
  return reservation;
}

export async function updateCartItem(
  sessionId: string,
  reservationId: string,
  quantity: number,
) {
  return updateCartReservation(reservationId, quantity, sessionId);
}

export async function removeFromCart(sessionId: string, reservationId: string) {
  return releaseReservation(reservationId, sessionId);
}

export async function getProductWithAvailability(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
  });
  if (!product) return null;

  const availableStock = await getAvailableStock(product.id);
  return { ...product, availableStock };
}

export async function listActiveProducts() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    products.map(async (product: (typeof products)[number]) => ({
      ...product,
      availableStock: await getAvailableStock(product.id),
    })),
  );
}
