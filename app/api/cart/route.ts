import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { getCart } from "@/lib/services/cart";
import { readCartSessionId } from "@/lib/session";

export async function GET() {
  try {
    const sessionId = await readCartSessionId();
    if (!sessionId) {
      return NextResponse.json({
        items: [],
        subtotal: 0,
        earliestExpiry: null,
      });
    }

    const cart = await getCart(sessionId);
    return NextResponse.json(cart);
  } catch (error) {
    return handleApiError(error);
  }
}
