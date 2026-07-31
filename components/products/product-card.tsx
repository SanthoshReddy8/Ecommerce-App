import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">
            <Link href={`/products/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </CardTitle>
          {outOfStock ? (
            <Badge variant="destructive">Out of stock</Badge>
          ) : lowStock ? (
            <Badge variant="secondary">Only {product.availableStock} left</Badge>
          ) : (
            <Badge variant="outline">{product.availableStock} available</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <p className="mt-3 text-lg font-semibold">{formatCurrency(product.price)}</p>
      </CardContent>
      <CardFooter>
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View details
        </Link>
      </CardFooter>
    </Card>
  );
}
