import { CouponType } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  type: z.nativeEnum(CouponType),
  value: z.number().int().min(1),
  maxUses: z.number().int().min(1),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = schema.parse(await request.json());
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: body.value,
        maxUses: body.maxUses,
        validFrom: new Date(body.validFrom),
        validUntil: new Date(body.validUntil),
        active: body.active,
      },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    return handleApiError(error);
  }
}
