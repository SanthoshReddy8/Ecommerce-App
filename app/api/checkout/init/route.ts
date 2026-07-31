import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { initializeCheckout } from "@/lib/services/order";
import { getCartSessionId } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const sessionId = await getCartSessionId();
    const order = await initializeCheckout({
      sessionId,
      ...body,
    });

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
