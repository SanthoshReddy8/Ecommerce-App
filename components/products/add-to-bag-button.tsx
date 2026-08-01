"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AddToBagButtonProps = {
  productId: string;
  disabled?: boolean;
};

export function AddToBagButton({ productId, disabled }: AddToBagButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to add to bag");
      }

      router.push("/bag");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to bag");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleAdd}
        disabled={disabled || loading}
        size="lg"
        className="h-12 w-full justify-between px-5 text-sm font-bold sm:max-w-sm"
      >
        <span className="flex items-center gap-2">
          <ShoppingBag className="size-4" />
          {loading ? "Adding..." : "Add to Bag"}
        </span>
        <ArrowRight className="size-4" />
      </Button>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
