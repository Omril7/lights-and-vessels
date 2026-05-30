import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Best-effort cleanup of Supabase Storage objects when the DB records (or
 * site-content values) that referenced them are deleted or replaced.
 *
 * Everything here is intentionally non-throwing: a storage hiccup must never
 * fail the user's delete/save. Orphaned files are cheap; a broken admin action
 * is not. Failures are logged and swallowed.
 *
 * Only objects that live under our own public bucket path are ever touched —
 * external URLs (picsum/unsplash fallbacks, signed URLs, anything else) are
 * ignored, so they can never be matched or removed.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "";

/** Public-URL prefix for our bucket, e.g. https://x.supabase.co/storage/v1/object/public/site-images/ */
function publicPrefix(): string | null {
  if (!SUPABASE_URL || !BUCKET) return null;
  return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/`;
}

/** The object path within the bucket for one of our public URLs, or null if it isn't ours. */
export function storagePathFromUrl(url: string): string | null {
  const prefix = publicPrefix();
  if (!prefix || typeof url !== "string") return null;
  const i = url.indexOf(prefix);
  if (i < 0) return null;
  const path = url.slice(i + prefix.length).trim();
  return path || null;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Pull every one of *our* storage URLs out of an arbitrary string. Works for a
 * bare URL or for a JSON blob that embeds URLs (gallery arrays, category maps,
 * testimonial objects) — the URL appears literally either way, so a scan finds
 * them all without needing to know the value's shape.
 */
export function extractStorageUrls(value: string | null | undefined): string[] {
  const prefix = publicPrefix();
  if (!prefix || !value) return [];
  // Match the prefix followed by path chars, stopping at any JSON/whitespace boundary.
  const re = new RegExp(`${escapeRegExp(prefix)}[^"'\\s\\\\)\\]}]+`, "g");
  return value.match(re) ?? [];
}

/** Delete the given public URLs from storage. Dedupes, ignores non-bucket URLs, never throws. */
export async function deleteStorageObjects(
  urls: Array<string | null | undefined>
): Promise<void> {
  if (!BUCKET) return;
  const paths = Array.from(
    new Set(
      urls
        .map((u) => (u ? storagePathFromUrl(u) : null))
        .filter((p): p is string => !!p)
    )
  );
  if (!paths.length) return;
  try {
    const { error } = await supabaseAdmin.storage.from(BUCKET).remove(paths);
    if (error) console.warn("[storage] cleanup failed:", error.message);
  } catch (e) {
    console.warn(
      "[storage] cleanup threw:",
      e instanceof Error ? e.message : e
    );
  }
}

/**
 * Delete objects that were present before an edit but are gone after it.
 * `oldUrls`/`newUrls` may be raw URLs or whole content strings — both are
 * scanned, so callers can pass either. A URL still referenced in `newUrls`
 * is kept (handles an image being moved between fields/keys).
 */
export async function deleteRemovedImages(
  oldUrls: Array<string | null | undefined>,
  newUrls: Array<string | null | undefined>
): Promise<void> {
  const oldPaths = new Set(
    oldUrls.flatMap((v) =>
      typeof v === "string"
        ? // a content blob may hold several URLs; a bare URL resolves to itself
          (extractStorageUrls(v).length ? extractStorageUrls(v) : [v])
        : []
    )
  );
  const keep = new Set(
    newUrls.flatMap((v) =>
      typeof v === "string"
        ? extractStorageUrls(v).length
          ? extractStorageUrls(v)
          : [v]
        : []
    )
  );
  const removed = Array.from(oldPaths).filter((u) => !keep.has(u));
  if (removed.length) await deleteStorageObjects(removed);
}
