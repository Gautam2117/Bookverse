import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const digest = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest("hex");
  if (digest !== signature) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(raw);
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    // upsert purchase by orderId if found (requires storing orderId during checkout for uid+book)
    // ... (implementation detail)
  }
  return NextResponse.json({ ok: true });
}