"use client";

import Image from "next/image";
import { useDeferredValue, useEffect, useState } from "react";
import { AlertTriangle, Boxes, PackageCheck, PackagePlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  active: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    imageUrl: "",
  });

  async function loadProducts() {
    const response = await fetch("/api/admin/products");
    const data = await response.json();
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function createProduct(event: React.FormEvent) {
    event.preventDefault();
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        imageUrl: form.imageUrl || undefined,
      }),
    });
    setForm({ name: "", description: "", price: "", stockQuantity: "", imageUrl: "" });
    loadProducts();
  }

  async function updateStock(id: string, stockQuantity: number) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQuantity }),
    });
    loadProducts();
  }

  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(deferredSearch.toLowerCase()),
  );
  const totalStock = products.reduce((total, product) => total + product.stockQuantity, 0);
  const lowStock = products.filter((product) => product.stockQuantity <= 5).length;

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Catalog operations</p>
          <h1 className="mt-2 font-heading text-4xl">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage listings, pricing, and sellable inventory.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs text-muted-foreground"><PackageCheck className="size-4 text-emerald-700" />Live catalog synced</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[{ label: "Active products", value: products.filter((p) => p.active).length, icon: Boxes }, { label: "Units available", value: totalStock, icon: PackageCheck }, { label: "Low stock", value: lowStock, icon: AlertTriangle }].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="mt-3 text-2xl font-bold">{value}</p></div>
        ))}
      </div>

      <Card className="rounded-lg shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-[#fbe1d8] text-primary"><PackagePlus className="size-4" /></span><div><CardTitle>Add product</CardTitle><p className="text-xs text-muted-foreground">Publish a new item to the live catalog</p></div></div>
        </CardHeader>
        <CardContent>
          <form onSubmit={createProduct} className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Price (paise)</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Stock</Label>
              <Input
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
            <div className="md:col-span-2"><Button type="submit" className="h-9 px-4">Create product</Button></div>
          </form>
        </CardContent>
      </Card>

      <section className="overflow-hidden rounded-lg border bg-white">
        <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div><h2 className="text-sm font-bold">Inventory</h2><p className="mt-1 text-xs text-muted-foreground">{visibleProducts.length} products shown</p></div>
          <div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="pl-9" /></div>
        </div>
        <div className="p-2 sm:p-4">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Update stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.map((product) => (
                <ProductStockRow
                  key={product.id}
                  product={product}
                  onSave={(stock) => updateStock(product.id, stock)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function ProductStockRow({
  product,
  onSave,
}: {
  product: Product;
  onSave: (stock: number) => void;
}) {
  const [stock, setStock] = useState(String(product.stockQuantity));

  return (
    <TableRow>
      <TableCell><div className="flex items-center gap-3"><div className="relative size-10 overflow-hidden rounded-md bg-muted">{product.imageUrl ? <Image src={product.imageUrl} alt="" fill className="object-cover" sizes="40px" /> : null}</div><div><p className="font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">{product.active ? "Published" : "Draft"}</p></div></div></TableCell>
      <TableCell>{formatCurrency(product.price)}</TableCell>
      <TableCell><span className={product.stockQuantity <= 5 ? "font-bold text-amber-700" : "font-semibold text-emerald-700"}>{product.stockQuantity} units</span></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Input
            className="w-24"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <Button size="sm" variant="outline" onClick={() => onSave(Number(stock))}>
            Save
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
