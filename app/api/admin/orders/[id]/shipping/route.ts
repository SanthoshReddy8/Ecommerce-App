import { OrderStatus } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { handleApiError } from "@/lib/api";
import { updateShippingProgress } from "@/lib/services/order";
import { z } from "zod";

const schema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().optional(),
});

export async function POST(
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

    const order = await updateShippingProgress({
      orderId: id,
      status: body.status,
      note: body.note,
    });

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
