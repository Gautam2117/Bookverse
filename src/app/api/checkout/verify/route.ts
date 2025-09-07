import { NextRequest, NextResponse } from 'next/server'
import crypto    from 'crypto'
import { adminDb } from '@/lib/firebase-admin.server'

export async function POST(req: NextRequest) {
  const { orderId, paymentId, signature, bookId, uid } = await req.json()

  if (![orderId, paymentId, signature, bookId, uid].every(Boolean))
    return NextResponse.json({ error:'missing' },{ status:400 })

  /* 1 ▸ verify HMAC ---------------------------------------------------- */
  const body     = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body).digest('hex')

  if (expected !== signature)
    return NextResponse.json({ error:'signature mismatch' },{ status:400 })

  /* 2 ▸ store purchase ------------------------------------------------- */
  await adminDb.collection('purchases').add({
    userId      : uid,
    bookId,
    priceINR    : undefined, // optional
    rzpOrderId  : orderId,
    rzpPaymentId: paymentId,
    rzpSignature: signature,
    purchasedAt : new Date(),
  })

  return NextResponse.json({ ok:true })
}
