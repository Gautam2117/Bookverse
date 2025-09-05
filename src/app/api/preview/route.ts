// src/app/api/preview/route.ts
import { NextRequest } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { PDFDocument } from "pdf-lib";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return new Response("Missing ?slug", { status: 400 });
  }

  const snap = await adminDb.doc(`books/${slug}`).get();
  if (!snap.exists) {
    return new Response("Not found", { status: 404 });
  }
  const book = snap.data() as any;

  // 1) Download the original PDF from Storage
  const file = adminStorage.bucket().file(book.filePathPdf);
  const [buf] = await file.download();     // buf: Buffer
  // Convert to Uint8Array for pdf-lib
  let bytes = new Uint8Array(buf);

  // 2) For premium books, build a short preview (first N pages)
  if (book.isPremium) {
    const src = await PDFDocument.load(bytes);
    const dst = await PDFDocument.create();
    const pagesToCopy = Math.min(5, src.getPageCount());
    const copied = await dst.copyPages(
      src,
      Array.from({ length: pagesToCopy }, (_, i) => i)
    );
    copied.forEach((p) => dst.addPage(p));
    bytes = Uint8Array.from(await dst.save()); // Ensure bytes is a plain Uint8Array
  }

  // 3) Return the PDF as ArrayBuffer (bytes.buffer)
  return new Response(bytes.buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}
