import { NextRequest, NextResponse } from "next/server";
import { rzp } from "@/lib/razorpay";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const { bookId } = await req.json();
  if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

  const bookSnap = await adminDb.doc(`books/${bookId}`).get();
  if (!bookSnap.exists) return NextResponse.json({ error: "Book not found" }, { status: 404 });
  const book = bookSnap.data()! as any;
  const amount = Math.max(1, Math.round(book.priceINR)) * 100; // paise

  const order = await rzp.orders.create({ amount, currency: "INR", receipt: `book_${bookId}_${Date.now()}` });

  return NextResponse.json({ orderId: order.id, amount, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID });
}