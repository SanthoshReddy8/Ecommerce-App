export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startReservationCleanupJob } = await import(
      "@/lib/jobs/release-expired-reservations"
    );
    startReservationCleanupJob();
  }
}
