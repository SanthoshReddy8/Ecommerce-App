"use client";

import { useEffect, useState } from "react";
import { BadgePercent, CircleGauge, TicketCheck, TicketPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    maxUses: "",
  });

  async function loadCoupons() {
    const response = await fetch("/api/admin/coupons");
    const data = await response.json();
    setCoupons(data.coupons ?? []);
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function createCoupon(event: React.FormEvent) {
    event.preventDefault();
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        maxUses: Number(form.maxUses),
        validFrom: now.toISOString(),
        validUntil: nextMonth.toISOString(),
      }),
    });

    setForm({ code: "", type: "PERCENT", value: "", maxUses: "" });
    loadCoupons();
  }

  async function toggleCoupon(id: string, active: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    loadCoupons();
  }

  const activeCoupons = coupons.filter((coupon) => coupon.active).length;
  const redemptions = coupons.reduce((total, coupon) => total + coupon.usedCount, 0);
  const capacity = coupons.reduce((total, coupon) => total + coupon.maxUses, 0);

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase text-primary">Promotions</p>
        <h1 className="mt-2 font-heading text-4xl">Coupons</h1>
        <p className="mt-2 text-sm text-muted-foreground">Usage includes active checkout holds and completed purchases.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[{ label: "Active coupons", value: activeCoupons, icon: TicketCheck }, { label: "Redemptions", value: redemptions, icon: BadgePercent }, { label: "Usage capacity", value: capacity ? `${Math.round((redemptions / capacity) * 100)}%` : "0%", icon: CircleGauge }].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="mt-3 text-2xl font-bold">{value}</p></div>
        ))}
      </div>

      <Card className="rounded-lg shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-[#fbe1d8] text-primary"><TicketPlus className="size-4" /></span><div><CardTitle>Create coupon</CardTitle><p className="text-xs text-muted-foreground">Valid for one month from creation</p></div></div>
        </CardHeader>
        <CardContent>
          <form onSubmit={createCoupon} className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value ?? "PERCENT" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Percent</SelectItem>
                  <SelectItem value="FIXED">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Value</Label>
              <Input
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Max Uses</Label>
              <Input
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-4"><Button type="submit">Create coupon</Button></div>
          </form>
        </CardContent>
      </Card>

      <section className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b p-4"><h2 className="text-sm font-bold">Promotion library</h2><p className="mt-1 text-xs text-muted-foreground">Enable or pause discount codes instantly</p></div>
        <div className="p-2 sm:p-4">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell><span className="rounded bg-muted px-2 py-1 font-mono text-xs font-bold">{coupon.code}</span></TableCell>
                  <TableCell>{coupon.type}</TableCell>
                  <TableCell>
                    {coupon.usedCount} / {coupon.maxUses}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.active ? "default" : "secondary"}>
                      {coupon.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCoupon(coupon.id, coupon.active)}
                    >
                      {coupon.active ? "Disable" : "Enable"}
                    </Button>
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
