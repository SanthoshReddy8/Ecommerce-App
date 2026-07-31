import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { updateCartItem } from "@/lib/services/cart";
import { readCartSessionId } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  reservationId: z.string().min(1),
  quantity: z.number().int().min(1),
});

export async function PATCH(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const sessionId = await readCartSessionId();
    if (!sessionId) {
      return NextResponse.json({ error: "No cart session" }, { status: 400 });
    }

    const reservation = await updateCartItem(
      sessionId,
      body.reservationId,
      body.quantity,
    );
    return NextResponse.json({ reservation });
  } catch (error) {
    return handleApiError(error);
  }
}
