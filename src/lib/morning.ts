/**
 * Morning (Green Invoice) API client.
 * Docs: https://www.greeninvoice.co.il/api-docs/
 *
 * Auth model: exchange (id, secret) for a short-lived JWT via POST /account/token,
 * cache it in-process, refresh on 401.
 */

const BASE = process.env.MORNING_API_BASE || "https://sandbox.d.greeninvoice.co.il/api/v1";
const KEY_ID = process.env.MORNING_API_KEY_ID || "";
const SECRET = process.env.MORNING_API_SECRET || "";
const PLUGIN_ID = process.env.MORNING_PLUGIN_ID || "";
const DEFAULT_DOC_TYPE = Number(process.env.MORNING_DEFAULT_DOC_TYPE || "400");

/** Morning's income[].vatType enum. עוסק פטור → 2 (Exempt). */
export const VAT_TYPE_EXEMPT = 2;

/** Morning document type codes. */
export const DOC_TYPE = {
  TAX_INVOICE_RECEIPT: 320,
  RECEIPT: 400,
  CREDIT_NOTE: 330,
} as const;

let tokenCache: { token: string; expiresAt: number } | null = null;

async function fetchToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5_000) return tokenCache.token;
  if (!KEY_ID || !SECRET) {
    throw new Error("Morning credentials missing: set MORNING_API_KEY_ID and MORNING_API_SECRET");
  }
  const res = await fetch(`${BASE}/account/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: KEY_ID, secret: SECRET }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Morning token request failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { token: string; expires?: number };
  // Tokens last ~30 minutes per Morning docs; cache for 25 to be safe.
  const ttl = data.expires ? data.expires * 1000 : 25 * 60 * 1000;
  tokenCache = { token: data.token, expiresAt: Date.now() + ttl };
  return data.token;
}

type ReqOpts = { method?: string; body?: unknown; query?: Record<string, string | number | undefined> };

async function morningFetch<T>(path: string, opts: ReqOpts = {}, _retry = false): Promise<T> {
  const token = await fetchToken();
  const url = new URL(`${BASE}${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    method: opts.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 401 && !_retry) {
    tokenCache = null;
    return morningFetch<T>(path, opts, true);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const safePath = url.pathname; // avoid logging query (may contain tokens/PII)
    console.error(`[morning] ${opts.method || "GET"} ${safePath} → ${res.status}: ${text}`);
    throw new Error(`Morning API error (${res.status}): ${text || res.statusText}`);
  }
  // Some endpoints (delete) may return empty body
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined as T;
  return (await res.json()) as T;
}

/* ---------------- Types ---------------- */

export type IncomeRow = {
  description: string;
  quantity: number;
  /** Unit price in ILS (for עוסק פטור, no VAT added). */
  price: number;
  currency?: "ILS";
  vatType?: number;
  itemId?: string;
};

export type MorningClient = {
  name: string;
  emails?: string[];
  phone?: string;
  address?: string;
  city?: string;
  country?: string; // ISO-2
  taxId?: string;
};

export type CreatePaymentFormInput = {
  description: string;
  type?: number;            // doc type; defaults to MORNING_DEFAULT_DOC_TYPE
  lang?: "he" | "en";
  currency?: "ILS";
  income: IncomeRow[];
  client: MorningClient;
  successUrl: string;
  failureUrl: string;
  notifyUrl: string;
  /** Custom external id we can echo through the IPN for correlation. */
  custom?: string;
  pluginId?: string;
};

export type CreatePaymentFormResult = {
  id: string;
  url: string;
  /** Some Morning responses also return errorCode / errorMessage at the top level. */
  errorCode?: number;
  errorMessage?: string;
};

/* ---------------- Endpoints ---------------- */

export async function createPaymentForm(input: CreatePaymentFormInput): Promise<CreatePaymentFormResult> {
  const body = {
    description: input.description,
    type: input.type ?? DEFAULT_DOC_TYPE,
    lang: input.lang ?? "he",
    currency: input.currency ?? "ILS",
    income: input.income.map((r) => ({
      description: r.description,
      quantity: r.quantity,
      price: r.price,
      currency: r.currency ?? "ILS",
      vatType: r.vatType ?? VAT_TYPE_EXEMPT,
      itemId: r.itemId,
    })),
    client: input.client,
    successUrl: input.successUrl,
    failureUrl: input.failureUrl,
    notifyUrl: input.notifyUrl,
    custom: input.custom,
    pluginId: input.pluginId || PLUGIN_ID || undefined,
  };
  return morningFetch<CreatePaymentFormResult>("/payments/form", { method: "POST", body });
}

export type MorningDocumentResponse = {
  id: string;
  number?: string;
  type: number;
  amount?: number;
  currency?: string;
  status?: number;
  url?: { origin?: string; he?: string; en?: string } | string;
  documentDate?: string;
  creationDate?: string;
};

export async function getDocument(id: string): Promise<MorningDocumentResponse> {
  return morningFetch<MorningDocumentResponse>(`/documents/${id}`);
}

export async function getDocumentPreviewUrl(id: string): Promise<string | null> {
  const doc = await getDocument(id);
  if (typeof doc.url === "string") return doc.url;
  return doc.url?.he ?? doc.url?.origin ?? doc.url?.en ?? null;
}

export type CreateCreditNoteInput = {
  originalDocumentId: string;
  amount: number;       // positive number; Morning treats credit notes as negatives internally
  description: string;
  client: MorningClient;
  income: IncomeRow[];  // mirror of original lines (or partial)
  sendByEmail?: boolean;
};

export async function createCreditNote(input: CreateCreditNoteInput): Promise<MorningDocumentResponse> {
  const body = {
    type: DOC_TYPE.CREDIT_NOTE,
    lang: "he",
    currency: "ILS",
    description: input.description,
    linkedDocumentIds: [input.originalDocumentId],
    client: input.client,
    income: input.income.map((r) => ({
      description: r.description,
      quantity: r.quantity,
      price: r.price,
      currency: r.currency ?? "ILS",
      vatType: r.vatType ?? VAT_TYPE_EXEMPT,
    })),
    sendByEmail: input.sendByEmail ?? false,
  };
  return morningFetch<MorningDocumentResponse>("/documents", { method: "POST", body });
}

export type ListDocumentsInput = {
  type?: number;
  from?: string; // YYYY-MM-DD
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function listDocuments(input: ListDocumentsInput = {}) {
  return morningFetch<{ items: MorningDocumentResponse[]; total: number }>("/documents/search", {
    method: "POST",
    body: {
      type: input.type ? [input.type] : undefined,
      fromDate: input.from,
      toDate: input.to,
      search: input.search,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 25,
    },
  });
}

export async function resendDocumentByEmail(id: string, email: string): Promise<void> {
  await morningFetch(`/documents/${id}/distribute`, {
    method: "POST",
    body: { emails: [email] },
  });
}

export async function getIncomeReport(input: { from: string; to: string }) {
  return morningFetch<{ rows: Array<{ date: string; amount: number; type: number }> }>(
    "/reports/income",
    { method: "POST", body: { fromDate: input.from, toDate: input.to } },
  );
}

/* ---------------- Webhook verification ---------------- */

import { createHmac, timingSafeEqual } from "crypto";

/** Verify Morning IPN signature using the shared MORNING_WEBHOOK_SECRET. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.MORNING_WEBHOOK_SECRET || "";
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature.replace(/^sha256=/, ""), "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
