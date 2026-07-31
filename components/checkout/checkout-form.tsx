"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/format";
import { RazorpayModal } from "@/components/checkout/razorpay-modal";

type CheckoutFormProps = {
  subtotal: number;
};

export function CheckoutForm({ subtotal }: CheckoutFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    orderId: string;
    orderNumber: string;
    amount: number;
    providerOrderId: string;
    keyId: string;
  } | null>(null);

  const total = Math.max(0, subtotal - discount);

  async function applyCoupon() {
    setError(null);
    const response = await fetch("/api/coupons/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not apply coupon");
      return;
    }

    const coupon = data.hold.coupon;
    const nextDiscount =
      coupon.type === "PERCENT"
        ? Math.floor((subtotal * coupon.value) / 100)
        : Math.min(subtotal, coupon.value);

    setDiscount(nextDiscount);
    setAppliedCoupon(coupon.code);
  }

  async function removeCoupon() {
    await fetch("/api/coupons/remove", { method: "POST" });
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
  }

  async function startCheckout() {
    setLoading(true);
    setError(null);

    try {
      const initResponse = await fetch("/api/checkout/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          shippingAddress: {
            line1,
            city,
            state,
            postalCode,
            country,
          },
        }),
      });

      const initData = await initResponse.json();
      if (!initResponse.ok) {
        throw new Error(initData.error ?? "Checkout failed");
      }

      const paymentResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: initData.order.id }),
      });

      const paymentPayload = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentPayload.error ?? "Payment init failed");
      }

      setPaymentData({
        orderId: initData.order.id,
        orderNumber: initData.order.orderNumber,
        amount: initData.order.total,
        providerOrderId: paymentPayload.paymentOrder.providerOrderId,
        keyId: paymentPayload.paymentOrder.keyId ?? "rzp_test_dummy",
      });
      setPaymentOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="line1">Address</Label>
          <Textarea id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coupon">Coupon code</Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="SAVE10"
            />
            <Button type="button" variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          {appliedCoupon ? (
            <Button type="button" variant="ghost" size="sm" onClick={removeCoupon}>
              Remove {appliedCoupon}
            </Button>
          ) : null}
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          className="w-full"
          size="lg"
          disabled={loading}
          onClick={startCheckout}
        >
          {loading ? "Starting checkout..." : "Pay with Razorpay"}
        </Button>
      </div>

      {paymentData ? (
        <RazorpayModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          {...paymentData}
        />
      ) : null}
    </div>
  );
}
