import type { Product, ProductStatus } from "@prisma/client";
import { localize } from "@/lib/utils";

/**
 * Client-safe product state helpers (no Prisma client import — types only).
 *
 * AVAILABLE   — listed in the store, buyable while stock lasts
 * COMING_SOON — listed in the store, no price, not buyable
 * SOLD        — not in the store; shown in the gallery, page still reachable
 * HIDDEN      — draft, never public
 */

/** Statuses whose product page is publicly reachable. */
export const PUBLIC_STATUSES: ProductStatus[] = ["AVAILABLE", "COMING_SOON", "SOLD"];

/** Statuses listed in the store grid. */
export const STORE_STATUSES: ProductStatus[] = ["AVAILABLE", "COMING_SOON"];

type StateFields = Pick<Product, "status" | "stockCount">;

export function isBuyable(p: StateFields): boolean {
  return p.status === "AVAILABLE" && p.stockCount > 0;
}

/** Listed as available but nothing left to sell. */
export function isSoldOut(p: StateFields): boolean {
  return p.status === "SOLD" || (p.status === "AVAILABLE" && p.stockCount <= 0);
}

export function isComingSoon(p: Pick<Product, "status">): boolean {
  return p.status === "COMING_SOON";
}

/** "03" — one-of-a-kind pieces are numbered with two digits. */
export function pieceLabel(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * The name shown everywhere: one-of-a-kind pieces get their number appended
 * ("פמוט 03"); everything else uses the plain name.
 */
export function displayName(
  p: Pick<Product, "name_he" | "name_en" | "isUnique" | "pieceNumber">,
  locale: string
): string {
  const name = localize(p, "name", locale);
  return p.isUnique && p.pieceNumber != null ? `${name} ${pieceLabel(p.pieceNumber)}` : name;
}
