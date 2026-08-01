import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, BadgeCheck, Clock3, RotateCcw, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductCard } from "@/components/products/product-card";
import { listActiveProducts } from "@/lib/services/cart";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listActiveProducts();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative isolate min-h-[620px] overflow-hidden bg-foreground text-white lg:min-h-[680px]">
          <Image
            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1800"
            alt="A modern workspace curated with everyday essentials"
            fill
            priority
            className="object-cover object-center opacity-65"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,18,15,.88)_0%,rgba(20,18,15,.46)_52%,rgba(20,18,15,.1)_100%)]" />
          <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-16 pt-24 sm:px-6 lg:min-h-[680px] lg:px-8 lg:pb-20">
            <div className="max-w-3xl animate-rise-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/15 px-4 py-2 text-xs font-bold uppercase backdrop-blur-sm">
                <Sparkles className="size-3.5 text-amber-300" />
                New objects for better days
              </div>
              <h1 className="font-heading text-5xl leading-[0.98] sm:text-6xl lg:text-8xl">
                ShopFlow,
                <span className="block text-[#ffc5ad]">thoughtfully selected.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
                Considered technology, travel gear, and home essentials chosen to work beautifully and last beyond the season.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="#collection" className="inline-flex h-12 items-center gap-2 rounded-md bg-[#f16645] px-5 text-sm font-bold text-white transition-colors hover:bg-[#d94f31]">
                  Shop the collection <ArrowDown className="size-4" />
                </Link>
                <Link href="/products/wireless-headphones" className="inline-flex h-12 items-center gap-2 rounded-md border border-white/35 px-5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-foreground">
                  Editor&apos;s pick <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-[#e2eee3]">
          <div className="mx-auto grid max-w-7xl divide-y divide-emerald-950/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
            {[{ icon: Clock3, title: "Stock held for you", text: "A 15-minute reservation while you checkout" }, { icon: BadgeCheck, title: "Secure payments", text: "Protected checkout with instant confirmation" }, { icon: RotateCcw, title: "Clear order tracking", text: "Updates from purchase through delivery" }].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-4 py-6 sm:px-6 first:pl-0 last:pr-0">
                <Icon className="size-5 shrink-0 text-emerald-800" />
                <div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-xs text-emerald-950/65">{text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section id="collection" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase text-primary">Curated essentials</p>
              <h2 className="font-heading text-4xl sm:text-5xl">The everyday edit</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">A focused selection of {products.length} useful, handsome objects for work, rest, and wherever you go next.</p>
          </div>
          {products.length > 0 ? (
            <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product: (typeof products)[number]) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <p className="py-20 text-center text-muted-foreground">The next collection is on its way.</p>
          )}
        </section>

        <section className="bg-[#222a25] text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
            <div><p className="text-xs font-bold uppercase text-[#ffc5ad]">A smarter bag</p><h2 className="mt-2 font-heading text-3xl sm:text-4xl">No overselling. No checkout surprises.</h2></div>
            <Link href="/bag" className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-foreground hover:bg-[#ffc5ad]">View your bag <ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-background"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p className="font-heading text-lg text-foreground">ShopFlow</p><p>Thoughtful goods. Reserved fairly. Delivered clearly.</p></div></footer>
    </>
  );
}
