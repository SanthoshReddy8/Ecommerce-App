import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Button } from "@/components/ui/button";
import { getCart } from "@/lib/services/cart";
import { readCartSessionId } from "@/lib/session";

export default async function CheckoutPage() {
  const sessionId = await readCartSessionId();
  if (!sessionId) {
    redirect("/bag");
  }

  const cart = await getCart(sessionId);
  if (cart.items.length === 0) {
    redirect("/bag");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-sm text-muted-foreground">
              Checkout extends your reservation while payment is in progress.
            </p>
          </div>
          <Button variant="outline">
            <Link href="/bag">Back to bag</Link>
          </Button>
        </div>
        <CheckoutForm subtotal={cart.subtotal} />
      </main>
    </>
  );
}
