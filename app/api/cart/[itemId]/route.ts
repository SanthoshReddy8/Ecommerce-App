import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { removeFromCart } from "@/lib/services/cart";
import { readCartSessionId } from "@/lib/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    const sessionId = await readCartSessionId();
    if (!sessionId) {
      return NextResponse.json({ error: "No cart session" }, { status: 400 });
    }

    await removeFromCart(sessionId, itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
