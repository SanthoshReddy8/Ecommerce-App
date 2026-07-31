import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { AddToBagButton } from "@/components/products/add-to-bag-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getProductWithAvailability } from "@/lib/services/cart";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductWithAvailability(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <Button variant="ghost" size="sm">
            <Link href="/">← Back to shop</Link>
          </Button>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : null}
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.availableStock === 0 ? (
                  <Badge variant="destructive">Out of stock</Badge>
                ) : (
                  <Badge variant="secondary">{product.availableStock} available</Badge>
                )}
              </div>
              <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>
            </div>
            <p className="text-muted-foreground">{product.description}</p>
            <AddToBagButton
              productId={product.id}
              disabled={product.availableStock === 0}
            />
          </div>
        </div>
      </main>
    </>
  );
}
