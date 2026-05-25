import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description:
    "הצהרת הנגישות של הסטודיו — המחויבות שלנו להנגשת האתר לכלל הגולשים, בהתאם לתקן הישראלי 5568 (IS 5568).",
};

export default function AccessibilityStatementPage() {
  const updated = new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
      <FadeIn>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/55">
          מסמך משפטי
        </p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          הצהרת נגישות
        </h1>
        <p className="mt-4 text-charcoal/75">
          הסטודיו רואה חשיבות עליונה בהנגשת האתר לכלל הגולשים, ובכלל זה אנשים
          עם מוגבלויות. אנו פועלים להבטיח שהאתר עומד בדרישות תקן ישראלי 5568
          (התואם להמלצות WCAG 2.0 ברמה AA), ככל שניתן בסביבה דיגיטלית.
        </p>
      </FadeIn>

      <div className="prose-art mt-10 space-y-8 text-charcoal">
        <FadeIn>
          <h2 className="font-serif text-2xl text-ink">התאמות נגישות באתר</h2>
          <p>
            באתר מותקן רכיב נגישות צף (כפתור עגול בפינת המסך) המאפשר לגולש לבחור
            התאמות אישיות לצורך גלישה נוחה יותר. בין השאר ניתן:
          </p>
          <ul>
            <li>להגדיל ולהקטין את גודל הטקסט.</li>
            <li>להפעיל ניגודיות גבוהה, מצב כהה או גוון חם.</li>
            <li>להחיל גווני אפור או להסתיר תמונות.</li>
            <li>להדגיש קישורים, כותרות וטקסט מודגש.</li>
            <li>להגדיל את ריווח האותיות והשורות.</li>
            <li>להחליף לגופן קריא יותר.</li>
            <li>להציג סמן עכבר מוגדל וקו הקראה אופקי.</li>
            <li>להדגיש את מסגרת המיקוד למשתמשי מקלדת.</li>
            <li>לעצור אנימציות ולעצור מדיה.</li>
          </ul>
          <p>
            ההגדרות נשמרות במכשיר ומיושמות אוטומטית בכל ביקור עתידי.
          </p>
        </FadeIn>

        <FadeIn>
          <h2 className="font-serif text-2xl text-ink">ניווט במקלדת</h2>
          <p>
            ניתן לנווט בכל האתר באמצעות מקלדת בלבד: <kbd>Tab</kbd> למעבר בין
            רכיבים, <kbd>Enter</kbd> או <kbd>Space</kbd> להפעלה, ו־
            <kbd>Esc</kbd> לסגירת חלונות. בתוך תפריט הנגישות ניתן לנווט בין
            האפשרויות באמצעות מקשי החיצים.
          </p>
        </FadeIn>

        <FadeIn>
          <h2 className="font-serif text-2xl text-ink">פניות בנושא נגישות</h2>
          <p>
            נתקלתם בקושי בגלישה? נשמח לדעת ולתקן. אפשר לפנות אלינו בוואטסאפ
            (הכפתור הצף בפינת המסך) או באימייל המופיע בעמוד "אודות".
          </p>
        </FadeIn>

        <FadeIn>
          <p className="text-sm text-charcoal/55">עודכן לאחרונה: {updated}</p>
        </FadeIn>
      </div>
    </main>
  );
}
