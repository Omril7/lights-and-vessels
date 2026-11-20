import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar, MobileTopbar } from "@/components/admin/Sidebar";

export const metadata = {
  title: "ניהול",
  manifest: "/manifest.webmanifest",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Login page: not authenticated yet, render bare children (no shell).
  // All other /admin/* routes are protected by middleware, so reaching here
  // means session exists.
  if (!session) {
    return <>{children}</>;
  }

  const email = session.user?.email ?? null;

  return (
    <div className="min-h-screen bg-linen font-sans text-ink">
      <Sidebar email={email} />
      <MobileTopbar email={email} />
      <main className="px-4 py-6 md:ms-64 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
