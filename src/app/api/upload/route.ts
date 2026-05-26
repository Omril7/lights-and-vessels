import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const form = await req.formData();
  const files = form.getAll("files");
  if (!files.length) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET!;
  const uploaded: { url: string; name: string; size: number }[] = [];

  for (const f of files) {
    if (!(f instanceof File)) continue;
    if (!ALLOWED.has(f.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${f.type}` },
        { status: 400 }
      );
    }
    if (f.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large: ${f.name}` },
        { status: 400 }
      );
    }

    const ext = EXT_BY_MIME[f.type] ?? "bin";
    const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, f, {
        contentType: f.type,
        cacheControl: "31536000, immutable",
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    uploaded.push({ url: data.publicUrl, name: f.name, size: f.size });
  }

  return NextResponse.json({ files: uploaded });
}
