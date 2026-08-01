"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, PackageCheck, Save, UserRound } from "lucide-react";
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
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Loading order...</div>;
  }

  return (
    <div className="space-y-7">
      <div>
        <Link href="/admin/orders" className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />All orders</Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase text-primary">Fulfillment detail</p><h1 className="mt-2 font-heading text-4xl">{order.orderNumber}</h1><p className="mt-2 text-sm text-muted-foreground">Created {new Date(order.createdAt).toLocaleString()}</p></div>
          <Badge variant="outline" className="w-fit">{order.status.replaceAll("_", " ")}</Badge>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-5">
        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Order items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border-b py-3 text-sm last:border-0">
                <div><p className="font-semibold">{item.productName}</p><p className="mt-1 text-xs text-muted-foreground">Quantity {item.quantity} × {formatCurrency(item.productPrice)}</p></div>
                <span className="font-bold">{formatCurrency(item.productPrice * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-4 text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>Customer and delivery</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="flex gap-3"><UserRound className="mt-0.5 size-4 text-primary" /><div><p className="text-xs text-muted-foreground">Customer</p><p className="mt-1 font-semibold">{order.customerName}</p></div></div><div className="flex gap-3"><Mail className="mt-0.5 size-4 text-primary" /><div><p className="text-xs text-muted-foreground">Email</p><p className="mt-1 font-semibold">{order.customerEmail}</p></div></div><div className="flex gap-3 sm:col-span-2"><MapPin className="mt-0.5 size-4 text-primary" /><div><p className="text-xs text-muted-foreground">Shipping address</p><p className="mt-1 leading-6">{order.shippingAddress}</p></div></div></CardContent></Card>
        </div>

        <Card className="h-fit rounded-lg border-emerald-950/15 bg-[#e6efe7] shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2"><PackageCheck className="size-4 text-emerald-800" /><CardTitle>Update shipping</CardTitle></div>
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
              <Label>Customer-facing note</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Package handed to courier..." />
            </div>
            <Button onClick={updateShipping} disabled={loading} className="w-full">
              <Save className="size-4" /> {loading ? "Saving..." : "Save progress"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-none">
        <CardHeader>
          <CardTitle>Shipping timeline</CardTitle>
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
