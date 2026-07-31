"use client";

import Link from "next/link";
import { ShoppingBag, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Package className="h-5 w-5" />
          ShopFlow
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Link href="/bag">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Bag
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Link href="/admin/login">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
