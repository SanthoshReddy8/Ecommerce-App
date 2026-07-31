"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage catalog inventory and stock levels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
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
            <Button type="submit" className="md:col-span-2">
              Create product
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Update Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <ProductStockRow
                  key={product.id}
                  product={product}
                  onSave={(stock) => updateStock(product.id, stock)}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
      <TableCell>{product.name}</TableCell>
      <TableCell>{formatCurrency(product.price)}</TableCell>
      <TableCell>{product.stockQuantity}</TableCell>
      <TableCell>
        <div className="flex gap-2">
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
