"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TrackingTimeline } from "@/components/orders/tracking-timeline";
import { formatCurrency } from "@/lib/format";

const statuses = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<string>("PROCESSING");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadOrder() {
    const response = await fetch(`/api/admin/orders/${params.id}`);
    const data = await response.json();
    setOrder(data.order);
    if (data.order?.status) setStatus(data.order.status);
  }

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  async function updateShipping() {
    setLoading(true);
    await fetch(`/api/admin/orders/${params.id}/shipping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    setNote("");
    await loadOrder();
    setLoading(false);
  }

  if (!order) {
    return <p>Loading order...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
        <p className="text-sm text-muted-foreground">
          {order.customerName} · {order.customerEmail}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span>{formatCurrency(item.productPrice * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value ?? "PROCESSING")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Note</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button onClick={updateShipping} disabled={loading}>
              {loading ? "Saving..." : "Update progress"}
            </Button>
            <Badge>{order.status.replaceAll("_", " ")}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingTimeline
            updates={order.shippingUpdates}
            currentStatus={order.status}
          />
        </CardContent>
      </Card>
    </div>
  );
}
