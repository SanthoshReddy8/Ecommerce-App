import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/services/inventory";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await releaseExpiredReservations();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[cron] release-reservations failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
