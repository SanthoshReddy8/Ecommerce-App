import { CouponReservationStatus, CouponType, Prisma } from "@/lib/generated/prisma";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { CouponError } from "@/lib/errors";

type TransactionClient = Prisma.TransactionClient;

async function lockCoupon(tx: TransactionClient, couponId: string) {
  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      code: string;
      type: CouponType;
      value: number;
      maxUses: number;
      usedCount: number;
      validFrom: Date;
      validUntil: Date;
      active: boolean;
    }>
  >`
    SELECT id, code, type, value, "maxUses", "usedCount", "validFrom", "validUntil", active
    FROM "Coupon"
    WHERE id = ${couponId}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

async function countActiveHolds(
  tx: TransactionClient,
  couponId: string,
  excludeSessionId?: string,
): Promise<number> {
  return tx.couponReservation.count({
    where: {
      couponId,
      status: CouponReservationStatus.HELD,
      expiresAt: { gt: new Date() },
      ...(excludeSessionId ? { NOT: { sessionId: excludeSessionId } } : {}),
    },
  });
}

export function calculateDiscount(
  subtotal: number,
  type: CouponType,
  value: number,
): number {
  if (type === CouponType.PERCENT) {
    return Math.min(subtotal, Math.floor((subtotal * value) / 100));
  }
  return Math.min(subtotal, value);
}

export async function applyCouponHold(code: string, sessionId: string) {
  const normalizedCode = code.trim().toUpperCase();
  const now = new Date();

  return prisma.$transaction(async (tx: TransactionClient) => {
    const coupon = await tx.coupon.findFirst({
      where: { code: normalizedCode, active: true },
    });

    if (!coupon) {
      throw new CouponError("Invalid coupon code");
    }

    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new CouponError("Coupon is not valid at this time");
    }

    const locked = await lockCoupon(tx, coupon.id);
    if (!locked) {
      throw new CouponError("Invalid coupon code");
    }

    await tx.couponReservation.updateMany({
      where: {
        sessionId,
        status: CouponReservationStatus.HELD,
      },
      data: { status: CouponReservationStatus.RELEASED },
    });

    const activeHolds = await countActiveHolds(tx, coupon.id, sessionId);
    if (locked.usedCount + activeHolds >= locked.maxUses) {
      throw new CouponError("Coupon usage limit reached");
    }

    const expiresAt = new Date(
      Date.now() + config.couponReservationTtlMinutes * 60 * 1000,
    );

    return tx.couponReservation.create({
      data: {
        couponId: coupon.id,
        sessionId,
        status: CouponReservationStatus.HELD,
        expiresAt,
      },
      include: { coupon: true },
    });
  });
}

export async function getActiveCouponHold(sessionId: string) {
  return prisma.couponReservation.findFirst({
    where: {
      sessionId,
      status: CouponReservationStatus.HELD,
      expiresAt: { gt: new Date() },
    },
    include: { coupon: true },
  });
}

export async function releaseCouponHold(sessionId: string) {
  return prisma.couponReservation.updateMany({
    where: {
      sessionId,
      status: CouponReservationStatus.HELD,
    },
    data: { status: CouponReservationStatus.RELEASED },
  });
}

export async function attachCouponHoldToOrder(
  sessionId: string,
  orderId: string,
) {
  const expiresAt = new Date(
    Date.now() + config.checkoutReservationTtlMinutes * 60 * 1000,
  );

  return prisma.couponReservation.updateMany({
    where: {
      sessionId,
      status: CouponReservationStatus.HELD,
      expiresAt: { gt: new Date() },
    },
    data: { orderId, expiresAt },
  });
}

export async function consumeCouponForOrder(orderId: string) {
  const hold = await prisma.couponReservation.findFirst({
    where: {
      orderId,
      status: CouponReservationStatus.HELD,
    },
    include: { coupon: true },
  });

  if (!hold) return null;

  return prisma.$transaction(async (tx: TransactionClient) => {
    await lockCoupon(tx, hold.couponId);
    await tx.coupon.update({
      where: { id: hold.couponId },
      data: { usedCount: { increment: 1 } },
    });
    await tx.couponReservation.update({
      where: { id: hold.id },
      data: { status: CouponReservationStatus.CONSUMED },
    });
    return hold.coupon;
  });
}
