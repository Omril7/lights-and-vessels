import { ReportsView } from "@/components/admin/ReportsView";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">ניהול</p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">דוחות</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          הכנסות החודשים האחרונים — נתונים שמורנינג מציגה בספרים שלך.
        </p>
      </header>
      <ReportsView />
    </div>
  );
}
