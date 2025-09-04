import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { addWatermark } from "@/lib/watermark";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  const uid = searchParams.get("uid"); // in real app, derive from session token/JWT
  if (!bookId || !uid) return NextResponse.json({ error: "missing" }, { status: 400 });

  // entitlement check
  const bookSnap = await adminDb.doc(`books/${bookId}`).get();
  if (!bookSnap.exists) return NextResponse.json({ error: "not found" }, { status: 404 });
  const book = bookSnap.data() as any;

  if (book.isPremium) {
    const q = await adminDb.collection("purchases").where("uid","==",uid).where("bookId","==",bookId).where("status","==","paid").limit(1).get();
    if (q.empty) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const bucket = adminStorage.bucket();
  const file = bucket.file(book.filePathPdf);
  const [buf] = await file.download();
  const watermarked = await addWatermark(buf, `Purchased by ${uid} • BookVerse`);

  return new NextResponse(Buffer.from(watermarked), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${book.slug}.pdf"`
    }
  });
}