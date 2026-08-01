"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  ShieldCheck,
  Store,
  Tags,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/coupons", label: "Coupons", icon: Tags },
];

type AdminShellProps = {
  children: React.ReactNode;
  userEmail?: string | null;
  signOutAction: () => Promise<void>;
};

export function AdminShell({ children, userEmail, signOutAction }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-foreground lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden min-h-screen flex-col border-r border-black/8 bg-[#1f2924] text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="flex h-18 items-center gap-3 border-b border-white/10 px-5">
          <span className="grid size-9 place-items-center rounded-md bg-[#f16645]">
            <Store className="size-4" />
          </span>
          <div>
            <p className="font-heading text-lg leading-none">ShopFlow</p>
            <p className="mt-1 text-[0.65rem] font-bold uppercase text-white/45">Operations</p>
          </div>
        </div>

        <div className="px-3 py-6">
          <p className="mb-2 px-3 text-[0.65rem] font-bold uppercase text-white/35">Workspace</p>
          <nav className="space-y-1" aria-label="Admin navigation">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors",
                    active ? "bg-white text-[#1f2924]" : "text-white/65 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-3">
          <Link href="/" className="mb-2 flex h-10 items-center justify-between rounded-md px-3 text-sm font-semibold text-white/65 hover:bg-white/8 hover:text-white">
            <span className="flex items-center gap-3"><ArrowUpRight className="size-4" />Live store</span>
          </Link>
          <div className="rounded-md bg-white/6 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="size-4 text-emerald-300" />Administrator</div>
            <p className="mt-1 truncate text-[0.68rem] text-white/45">{userEmail}</p>
            <form action={signOutAction} className="mt-3">
              <button type="submit" className="flex w-full items-center gap-2 text-xs font-semibold text-white/55 hover:text-white">
                <LogOut className="size-3.5" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-black/8 bg-[#f4f5f2]/92 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/admin/products" className="flex items-center gap-2 font-heading text-lg"><LayoutDashboard className="size-4" />ShopFlow Ops</Link>
            <Link href="/" className="grid size-9 place-items-center rounded-md border bg-white" aria-label="Open live store"><ArrowUpRight className="size-4" /></Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3" aria-label="Admin navigation">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={cn("flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-bold", pathname.startsWith(href) ? "bg-foreground text-background" : "bg-white text-muted-foreground")}>
                <Icon className="size-3.5" />{label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8 xl:p-10">{children}</main>
      </div>
    </div>
  );
}
