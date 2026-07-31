"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          Coupon usage includes active checkout holds, not just completed orders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Coupon</CardTitle>
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
            <Button type="submit" className="md:col-span-4">
              Create coupon
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
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
                  <TableCell>{coupon.code}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
