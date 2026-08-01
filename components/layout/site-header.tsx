import Link from "next/link";
import { LockKeyhole, Package, Shield, ShoppingBag } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/8 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="ShopFlow home">
          <span className="grid size-9 place-items-center rounded-md bg-foreground text-background transition-transform group-hover:-rotate-3">
            <Package className="size-4" />
          </span>
          <span className="font-heading text-xl">ShopFlow</span>
        </Link>
        <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground md:flex">
          <LockKeyhole className="size-3.5 text-emerald-700" />
          Stock secured for 15 minutes
        </div>
        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          <Link
            href="/admin/login"
            className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Admin portal"
            aria-label="Admin portal"
          >
            <Shield className="size-4" />
          </Link>
          <Link
            href="/bag"
            className="flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-sm font-semibold text-background transition-colors hover:bg-primary"
          >
            <ShoppingBag className="size-4" />
            <span>Bag</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
