"use client";

import Image from "next/image";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginPanel() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
  const error = params.get("error");

  const errorMessage =
    error === "AccessDenied"
      ? "האימייל הזה אינו מורשה לכניסה לניהול."
      : error
      ? "ההתחברות נכשלה. נסו שוב."
      : null;

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-charcoal/10 bg-cream/90 p-8 shadow-soft backdrop-blur">
      <div className="text-center">
        <h1 className="font-serif text-3xl text-charcoal">כניסת מנהל</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          רק לבעל הסטודיו
        </p>
      </div>

      {errorMessage && (
        <p
          className="rounded-xl bg-terracotta/10 px-3 py-2 text-center text-sm text-terracotta"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {/* Exact Google Identity Services "Sign in with Google" spec:
          40px height, 12px h-padding, 10px icon-text gap, 1px #747775 border,
          4px radius, Roboto Medium 14px, hover #F8FAFD, focus ring Google blue. */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="relative flex h-10 w-full items-center justify-center gap-[10px] rounded-full border border-[#747775] bg-white px-5 text-[14px] font-medium leading-none tracking-[0.25px] text-[#1F1F1F] transition-colors hover:bg-[#F8FAFD] active:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8] focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        style={{
          fontFamily:
            "'Roboto', 'Google Sans', 'Segoe UI', Arial, sans-serif",
          boxShadow: "0 1px 2px 0 rgba(60,64,67,.08)",
        }}
      >
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <Image
            src="/google.png"
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px] object-contain"
            aria-hidden
          />
        </span>
        <span>התחברות עם Google</span>
      </button>

      <p className="text-center text-xs text-charcoal/50">
        רק חשבונות Google מאושרים יכולים להיכנס. אם מגיע לך גישה ועדיין נחסמת — פנה אליי.
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linen px-4 py-16">
      <Suspense>
        <LoginPanel />
      </Suspense>
    </main>
  );
}
