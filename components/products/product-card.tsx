import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    imageUrl: string | null;
    availableStock: number;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const lowStock = product.availableStock > 0 && product.availableStock <= 5;
  const outOfStock = product.availableStock === 0;

  return (
    <article className="group min-w-0 animate-rise-in">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-muted"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : null}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3">
          <Badge className="border-0 bg-background/92 text-foreground shadow-sm backdrop-blur">
            {outOfStock ? "Sold out" : lowStock ? `Only ${product.availableStock} left` : "In stock"}
          </Badge>
          <span className="grid size-9 translate-y-1 place-items-center rounded-full bg-foreground text-background opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </Link>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-[0.68rem] font-bold uppercase text-primary">The everyday edit</p>
            <h3 className="font-heading text-xl leading-tight">
              <Link href={`/products/${product.slug}`}>{product.name}</Link>
            </h3>
          </div>
          <p className="shrink-0 text-sm font-bold">{formatCurrency(product.price)}</p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{product.description}</p>
        <Link
          href={`/products/${product.slug}`}
          className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          Explore item <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
