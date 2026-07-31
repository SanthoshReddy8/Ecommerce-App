import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoginPage = false;

  return (
    <div className="min-h-screen bg-muted/20">
      {session?.user ? (
        <header className="border-b bg-background">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/products" className="font-semibold">
                ShopFlow Admin
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <nav className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Link href="/admin/products">Products</Link>
                </Button>
                <Button variant="ghost" size="sm">
                  <Link href="/admin/coupons">Coupons</Link>
                </Button>
                <Button variant="ghost" size="sm">
                  <Link href="/admin/orders">Orders</Link>
                </Button>
              </nav>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </header>
      ) : null}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
