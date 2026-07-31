"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";

type RazorpayModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  amount: number;
  providerOrderId: string;
  keyId: string;
};

export function RazorpayModal({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  amount,
  providerOrderId,
  keyId,
}: RazorpayModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function completePayment(success: boolean) {
    setLoading(true);
    setError(null);

    try {
      if (!success) {
        onOpenChange(false);
        return;
      }

      const paymentId = `pay_dummy_${Date.now()}`;
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          providerOrderId,
          paymentId,
          signature: "dummy_ok",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Payment verification failed");
      }

      router.push(`/orders/${orderNumber}?success=1`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dummy Razorpay Checkout</DialogTitle>
          <DialogDescription>
            This simulates Razorpay for local development. Swap the payment provider in env to use Stripe later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
          <p>
            <span className="font-medium">Key:</span> {keyId}
          </p>
          <p>
            <span className="font-medium">Order:</span> {providerOrderId}
          </p>
          <p>
            <span className="font-medium">Amount:</span> {formatCurrency(amount)}
          </p>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" disabled={loading} onClick={() => completePayment(false)}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={() => completePayment(true)}>
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
