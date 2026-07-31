import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import {
  OrderSummary,
  TrackingTimeline,
} from "@/components/orders/tracking-timeline";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getOrderByNumber } from "@/lib/services/order";

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { orderNumber } = await params;
  const query = await searchParams;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        <div>
          <h1 className="text-3xl font-bold">Track Purchase</h1>
          <p className="text-sm text-muted-foreground">
            Follow your order status and shipping progress.
          </p>
        </div>

        {query.success ? (
          <Alert>
            <AlertDescription>
              Payment successful. A confirmation notification has been queued.
            </AlertDescription>
          </Alert>
        ) : null}

        <OrderSummary order={order} />
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Shipping Timeline</h2>
          <TrackingTimeline
            updates={order.shippingUpdates.map((update: (typeof order.shippingUpdates)[number]) => ({
              ...update,
              createdAt: update.createdAt.toISOString(),
            }))}
            currentStatus={order.status}
          />
        </div>
      </main>
    </>
  );
}
