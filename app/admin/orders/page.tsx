"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CircleDollarSign, Clock3, PackageCheck, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []));
  }, []);

  const revenue = orders.reduce((total, order) => total + order.total, 0);
  const openOrders = orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length;
  const delivered = orders.filter((order) => order.status === "DELIVERED").length;

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase text-primary">Fulfillment</p>
        <h1 className="mt-2 font-heading text-4xl">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track purchases and move each shipment forward.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Total orders", value: orders.length, icon: ReceiptText }, { label: "Open fulfillment", value: openOrders, icon: Clock3 }, { label: "Delivered", value: delivered, icon: PackageCheck }, { label: "Order value", value: formatCurrency(revenue), icon: CircleDollarSign }].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="mt-3 text-2xl font-bold">{value}</p></div>
        ))}
      </div>

      <section className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b p-4"><h2 className="text-sm font-bold">All orders</h2><p className="mt-1 text-xs text-muted-foreground">Newest purchases appear first</p></div>
        <div className="p-2 sm:p-4">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell><p className="font-mono text-xs font-semibold">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p></TableCell>
                  <TableCell className="font-semibold">{order.customerName}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "DELIVERED" ? "secondary" : "outline"}>{order.status.replaceAll("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" render={<Link href={`/admin/orders/${order.id}`} />}>Manage <ArrowUpRight /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
