import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  active: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = schema.parse(await request.json());

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { active: body.active },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    return handleApiError(error);
  }
}
