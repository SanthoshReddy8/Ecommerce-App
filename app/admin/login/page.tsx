import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const query = await searchParams;
  const callbackUrl = query.callbackUrl ?? "/admin/products";

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirectTo: callbackUrl,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/admin/login?error=invalid`);
      }
      throw error;
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f4f5f2] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#1f2924] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-80 rounded-full border border-white/8" />
        <div className="absolute -right-10 -top-10 size-52 rounded-full border border-white/8" />
        <Link href="/" className="relative flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft className="size-4" />Back to store</Link>
        <div className="relative max-w-lg">
          <span className="mb-6 grid size-12 place-items-center rounded-lg bg-[#f16645]"><ShieldCheck className="size-5" /></span>
          <h1 className="font-heading text-6xl leading-[1.02]">Run the store.<br /><span className="text-[#ffc5ad]">See the whole flow.</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/60">Inventory, promotions, fulfillment, and shipping updates in one focused workspace.</p>
        </div>
        <div className="relative flex gap-8 text-xs text-white/45"><span className="flex items-center gap-2"><PackageCheck className="size-4 text-emerald-300" />Live inventory</span><span className="flex items-center gap-2"><LockKeyhole className="size-4 text-emerald-300" />Protected access</span></div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold lg:hidden"><ArrowLeft className="size-4" />Back to store</Link>
          <p className="text-xs font-bold uppercase text-primary">ShopFlow operations</p>
          <h2 className="mt-3 font-heading text-4xl">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with your administrator credentials.</p>
          <form action={login} className="space-y-4">
            <div className="mt-8 grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@store.com"
                autoComplete="username"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            {query.error ? (
              <Alert variant="destructive">
                <AlertDescription>Invalid admin credentials</AlertDescription>
              </Alert>
            ) : null}
            <Button className="h-11 w-full justify-between px-4" type="submit">
              Sign in <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">Access is restricted to authorized store operators.</p>
        </div>
      </section>
    </div>
  );
}
