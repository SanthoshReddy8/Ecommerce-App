"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { ReservationTimer } from "@/components/cart/reservation-timer";

type BagItemProps = {
  item: {
    id: string;
    quantity: number;
    expiresAt: string;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      imageUrl: string | null;
    };
  };
};

export function BagItem({ item }: BagItemProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [loading, setLoading] = useState(false);

  async function updateQuantity(nextQty: number) {
    setLoading(true);
    try {
      const response = await fetch("/api/cart/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: item.id, quantity: nextQty }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Update failed");
      }
      setQuantity(nextQty);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem() {
    setLoading(true);
    try {
      const response = await fetch(`/api/cart/${item.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Remove failed");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Remove failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-4 rounded-lg border p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/products/${item.product.slug}`} className="font-medium hover:underline">
              {item.product.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(item.product.price)} each
            </p>
          </div>
          <p className="font-semibold">
            {formatCurrency(item.product.price * quantity)}
          </p>
        </div>
        <ReservationTimer expiresAt={item.expiresAt} />
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-20"
            disabled={loading}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => updateQuantity(quantity)}
          >
            Update
          </Button>
          <Button variant="ghost" size="sm" disabled={loading} onClick={removeItem}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
