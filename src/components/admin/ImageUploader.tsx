"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import {
  TrashIcon,
  ArrowsUpDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export type UploadedImage = { url: string; alt?: string | null };

export function ImageUploader({
  images,
  onChange,
  folder = "products",
}: {
  images: UploadedImage[];
  onChange: (next: UploadedImage[]) => void;
  folder?: "products" | "blog" | "content";
}) {
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const upload = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("folder", folder);
        for (const f of files) fd.append("files", f);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "השרת דחה את ההעלאה");
        }
        const data = (await res.json()) as {
          files: { url: string; name: string }[];
        };
        onChange([
          ...images,
          ...data.files.map((f) => ({ url: f.url, alt: null })),
        ]);
        toast.success("התמונות הועלו");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "שגיאה בהעלאה");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange, folder]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: upload,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/avif": [".avif"],
    },
    multiple: true,
  });

  const remove = (i: number) =>
    onChange(images.filter((_, idx) => idx !== i));

  const updateAlt = (i: number, alt: string) =>
    onChange(images.map((img, idx) => (idx === i ? { ...img, alt } : img)));

  const reorder = (from: number, to: number) => {
    if (from === to || to < 0 || to >= images.length) return;
    const next = images.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-copper bg-gold/10"
            : "border-charcoal/20 bg-cream hover:border-charcoal/40",
          uploading && "opacity-60 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-charcoal">
          {isDragActive
            ? "שחררו כאן את הקבצים"
            : "גררו תמונות לכאן או לחצו לבחירה"}
        </p>
        <p className="text-xs text-charcoal/50">
          JPG, PNG, WEBP, GIF, AVIF · עד 8MB לקובץ
        </p>
        {uploading && (
          <p className="text-xs text-copper">מעלה…</p>
        )}
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <li
              key={`${img.url}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, i);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-cream",
                dragIndex === i
                  ? "border-copper opacity-60"
                  : "border-charcoal/10"
              )}
            >
              <div className="relative aspect-[4/5] bg-linen">
                <Image
                  src={img.url}
                  alt={img.alt || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 50vw, 25vw"
                  unoptimized={img.url.startsWith("/api/uploads/")}
                />
                {i === 0 && (
                  <span className="absolute start-2 top-2 rounded-full bg-charcoal/80 px-2 py-0.5 text-[0.6rem] text-cream">
                    ראשית
                  </span>
                )}
              </div>
              <div className="space-y-1 p-2">
                <input
                  type="text"
                  value={img.alt ?? ""}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  placeholder="תיאור התמונה (alt)"
                  className="w-full rounded-lg border border-charcoal/10 bg-cream px-2 py-1 text-xs"
                />
                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => reorder(i, i - 1)}
                      disabled={i === 0}
                      className="rounded-md p-1 text-charcoal/60 hover:bg-charcoal/[0.06] disabled:opacity-30"
                      aria-label="הזזה אחורה"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorder(i, i + 1)}
                      disabled={i === images.length - 1}
                      className="rounded-md p-1 text-charcoal/60 hover:bg-charcoal/[0.06] disabled:opacity-30"
                      aria-label="הזזה קדימה"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <span className="self-center text-[0.6rem] text-charcoal/40">
                      <ArrowsUpDownIcon className="inline h-3 w-3" /> גרירה
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="rounded-md p-1 text-terracotta hover:bg-terracotta/10"
                    aria-label="מחיקה"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
