import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Sidebar,
  MobileTopbar,
  MobileBottomNav,
} from "@/components/admin/Sidebar";

export const metadata = {
  title: "ניהול",
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

  return (
    <div className="min-h-screen bg-linen text-ink">
      <Sidebar />
      <MobileTopbar />
      <main className="md:me-64 px-4 py-6 md:px-10 md:py-10 pb-24 md:pb-10">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
