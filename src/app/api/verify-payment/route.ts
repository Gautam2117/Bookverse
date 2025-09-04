import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const { orderId, paymentId, signature, bookId, uid } = await req.json();
  if (!orderId || !paymentId || !signature || !bookId || !uid) return NextResponse.json({ error: "missing" }, { status: 400 });

  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(body).digest("hex");
  if (expected !== signature) return NextResponse.json({ error: "signature mismatch" }, { status: 400 });

  const ref = await adminDb.collection("purchases").add({
    uid, bookId, amountINR: undefined, status: "paid", rzpOrderId: orderId, rzpPaymentId: paymentId, rzpSignature: signature, createdAt: new Date(), updatedAt: new Date()
  });

  return NextResponse.json({ ok: true, purchaseId: ref.id });
}