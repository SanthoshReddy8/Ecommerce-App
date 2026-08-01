import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Clock3, PackageCheck } from "lucide-react";
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
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8">
          <Button variant="ghost" size="sm" render={<Link href="/" />}>
            <ArrowLeft /> Back to collection
          </Button>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.12fr_.88fr] lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted lg:aspect-square">
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
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-bold uppercase text-primary">The everyday edit</p>
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="max-w-lg font-heading text-4xl leading-tight sm:text-5xl">{product.name}</h1>
                {product.availableStock === 0 ? (
                  <Badge variant="destructive">Out of stock</Badge>
                ) : (
                  <Badge variant="secondary">In stock</Badge>
                )}
              </div>
              <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
            </div>
            <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground">{product.description}</p>
            <div className="my-8 h-px bg-border" />
            <AddToBagButton productId={product.id} disabled={product.availableStock === 0} />
            <div className="mt-8 grid gap-4 border-t border-border pt-7 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[{ icon: Clock3, label: "15-min stock hold" }, { icon: BadgeCheck, label: "Secure payment" }, { icon: PackageCheck, label: "Order tracking" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Icon className="size-4 text-emerald-700" />{label}</div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
