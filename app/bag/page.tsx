import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { BagItem } from "@/components/cart/bag-item";
import { ReservationTimer } from "@/components/cart/reservation-timer";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getCart } from "@/lib/services/cart";
import { readCartSessionId } from "@/lib/session";

export default async function BagPage() {
  const sessionId = await readCartSessionId();
  const cart = sessionId
    ? await getCart(sessionId)
    : { items: [], subtotal: 0, earliestExpiry: null };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your Bag</h1>
            <p className="text-sm text-muted-foreground">
              Reserved stock is held temporarily until checkout or expiry.
            </p>
          </div>
          <ReservationTimer expiresAt={cart.earliestExpiry} />
        </div>

        {cart.items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Button className="mt-4">
              <Link href="/">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {cart.items.map((item: (typeof cart.items)[number]) => (
                <BagItem
                  key={item.id}
                  item={{
                    ...item,
                    expiresAt: item.expiresAt.toISOString(),
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-xl font-semibold">{formatCurrency(cart.subtotal)}</p>
              </div>
              <Button size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
