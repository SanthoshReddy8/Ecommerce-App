import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

type TrackingTimelineProps = {
  updates: Array<{
    id: string;
    status: string;
    note: string | null;
    createdAt: string | Date;
  }>;
  currentStatus: string;
};

export function TrackingTimeline({ updates, currentStatus }: TrackingTimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Current status</span>
        <Badge>{currentStatus.replaceAll("_", " ")}</Badge>
      </div>
      <ol className="space-y-4 border-l pl-4">
        {updates.map((update) => (
          <li key={update.id} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
            <p className="font-medium">{update.status.replaceAll("_", " ")}</p>
            {update.note ? (
              <p className="text-sm text-muted-foreground">{update.note}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              {new Date(update.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

type OrderSummaryProps = {
  order: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    subtotal: number;
    discount: number;
    total: number;
    items: Array<{
      productName: string;
      quantity: number;
      productPrice: number;
    }>;
  };
};

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Order {order.orderNumber}</h2>
      <p className="text-sm text-muted-foreground">
        {order.customerName} · {order.customerEmail}
      </p>
      <div className="mt-4 space-y-2">
        {order.items.map((item) => (
          <div key={`${item.productName}-${item.quantity}`} className="flex justify-between text-sm">
            <span>
              {item.productName} x {item.quantity}
            </span>
            <span>{formatCurrency(item.productPrice * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-1 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>-{formatCurrency(order.discount)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
