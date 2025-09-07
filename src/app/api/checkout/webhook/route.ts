import { NextRequest, NextResponse } from 'next/server'
import crypto                         from 'crypto'
import { adminDb }                    from '@/lib/firebase-admin.server'

/** ── force Node runtime because `crypto` isn’t available in the Edge one ── */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'   // never cache this route

/* ────────────────────────────────────────────────────────────────────────── */
export async function POST (req: NextRequest) {
  /* 1 ▸ read raw body + verify Razorpay signature ------------------------ */
  const raw       = await req.text()                  // ← *unparsed* body
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  const secret    = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook] missing env RAZORPAY_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'mis-config' }, { status: 500 })
  }

  const expected = crypto.createHmac('sha256', secret)
    .update(raw)
    .digest('hex')

  if (expected !== signature) {
    console.warn('[webhook] signature mismatch')
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  /* 2 ▸ parse the *already-verified* payload ----------------------------- */
  let event: any
  try   { event = JSON.parse(raw) }
  catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  /* 3 ▸ handle the events you care about --------------------------------- */
  if (event?.event === 'payment.captured') {
    const payment   = event.payload.payment.entity
    const orderId   = payment.order_id as string
    const paymentId = payment.id       as string
    const amountRS  = payment.amount / 100   // paise → ₹

    /* 4 ▸ mark the purchase as paid (or create one if it’s missing) —— */
    try {
      /* You already stored a *placeholder* doc when the order was created
         (see `checkout/route.ts`).  Look it up by its Razorpay order-id.   */
      const snap = await adminDb
        .collection('purchases')
        .where('rzpOrderId', '==', orderId)
        .limit(1)
        .get()

      if (!snap.empty) {
        // update existing placeholder
        await snap.docs[0].ref.update({
          status       : 'paid',
          amountINR    : amountRS,
          rzpPaymentId : paymentId,
          updatedAt    : new Date(),
        })
      } else {
        // *failsafe* – create a record if, for some reason, the placeholder
        // isn’t there (we’ll try to pull user/book from Razorpay notes)
        await adminDb.collection('purchases').add({
          uid          : payment.notes?.uid      ?? null,
          bookId       : payment.notes?.bookId   ?? null,
          amountINR    : amountRS,
          rzpOrderId   : orderId,
          rzpPaymentId : paymentId,
          status       : 'paid',
          createdAt    : new Date(),
          updatedAt    : new Date(),
        })
      }
    } catch (err) {
      console.error('[webhook] Firestore error', err)
      return NextResponse.json({ error: 'db-error' }, { status: 500 })
    }
  }

  /* 5 ▸ always respond 2xx quickly so Razorpay stops retrying ------------- */
  return NextResponse.json({ received: true })
}
