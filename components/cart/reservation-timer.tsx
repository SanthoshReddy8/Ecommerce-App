"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type ReservationTimerProps = {
  expiresAt: string | Date | null;
};

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ReservationTimer({ expiresAt }: ReservationTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }

    const target = new Date(expiresAt).getTime();
    const tick = () => setRemaining(target - Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt || remaining === null) return null;

  const expired = remaining <= 0;

  return (
    <Badge variant={expired ? "destructive" : "secondary"}>
      {expired
        ? "Reservation expired"
        : `Stock held for ${formatRemaining(remaining)}`}
    </Badge>
  );
}
