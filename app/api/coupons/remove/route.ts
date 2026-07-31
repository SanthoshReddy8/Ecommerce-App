import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { releaseCouponHold } from "@/lib/services/coupon";
import { readCartSessionId } from "@/lib/session";

export async function POST() {
  try {
    const sessionId = await readCartSessionId();
    if (!sessionId) {
      return NextResponse.json({ success: true });
    }

    await releaseCouponHold(sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
