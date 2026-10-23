import { DocumentsArchive } from "@/components/admin/DocumentsArchive";

export const dynamic = "force-dynamic";

export default function AdminDocumentsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">ניהול</p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">מסמכים</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          ארכיון חשבוניות, קבלות וזיכויים מתוך חשבון מורנינג.
        </p>
      </header>
      <DocumentsArchive />
    </div>
  );
}
