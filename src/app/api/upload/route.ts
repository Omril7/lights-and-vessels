import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/admin";

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

  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

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
    const id = randomBytes(8).toString("hex");
    const filename = `${Date.now()}-${id}.${ext}`;
    const buffer = Buffer.from(await f.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    uploaded.push({
      url: `/api/uploads/${filename}`,
      name: f.name,
      size: f.size,
    });
  }

  return NextResponse.json({ files: uploaded });
}
