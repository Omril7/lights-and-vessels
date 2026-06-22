"use client";

import { useEffect } from "react";
import heMessages from "../../messages/he.json";

const m = heMessages.errors;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          padding: "2rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#f7f2ea",
          color: "#1f1d1a",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{m.globalError}</h1>
        <p style={{ color: "#6b675f", margin: 0 }}>{m.globalMessage}</p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.6rem 1.4rem",
            borderRadius: "999px",
            border: "1px solid #1f1d1a",
            background: "#1f1d1a",
            color: "#f7f2ea",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          {m.retry}
        </button>
        {error.digest && (
          <p style={{ fontSize: "0.75rem", color: "#a39e93", direction: "ltr" }}>
            ref: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
