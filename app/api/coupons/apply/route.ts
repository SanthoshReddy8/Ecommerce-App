import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { applyCouponHold } from "@/lib/services/coupon";
import { getCartSessionId } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const sessionId = await getCartSessionId();
    const hold = await applyCouponHold(body.code, sessionId);
    return NextResponse.json({ hold });
  } catch (error) {
    return handleApiError(error);
  }
}
