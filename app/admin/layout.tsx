import { auth, signOut } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  if (!session?.user) return children;

  return <AdminShell userEmail={session.user.email} signOutAction={signOutAction}>{children}</AdminShell>;
}
