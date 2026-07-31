import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { getOrderByNumber } from "@/lib/services/order";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const { orderNumber } = await params;
    const order = await getOrderByNumber(orderNumber);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
