import cron from "node-cron";
import { releaseExpiredReservations } from "@/lib/services/inventory";

let started = false;

export function startReservationCleanupJob() {
  if (started || process.env.NODE_ENV === "test") return;
  started = true;

  cron.schedule("* * * * *", async () => {
    try {
      const result = await releaseExpiredReservations();
      if (result.stockReleased > 0 || result.couponReleased > 0) {
        console.log(
          `[cleanup] Released ${result.stockReleased} stock and ${result.couponReleased} coupon reservations`,
        );
      }
    } catch (error) {
      console.error("[cleanup] Failed to release expired reservations", error);
    }
  });
}
