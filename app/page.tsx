import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductCard } from "@/components/products/product-card";
import { listActiveProducts } from "@/lib/services/cart";

export default async function HomePage() {
  const products = await listActiveProducts();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Featured Products</h1>
          <p className="text-muted-foreground">
            Add items to your bag to reserve stock for 15 minutes while you decide.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product: (typeof products)[number]) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 ? (
          <p className="text-muted-foreground">No products available yet.</p>
        ) : null}
      </main>
    </>
  );
}
