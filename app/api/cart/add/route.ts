import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { addToCart } from "@/lib/services/cart";
import { getCartSessionId } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const sessionId = await getCartSessionId();
    const reservation = await addToCart(
      sessionId,
      body.productId,
      body.quantity,
    );

    return NextResponse.json({ reservation });
  } catch (error) {
    return handleApiError(error);
  }
}
