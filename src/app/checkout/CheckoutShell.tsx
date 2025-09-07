'use client'

import { useState } from 'react'
import Script       from 'next/script'
import { toast }    from 'sonner'
import { useRouter } from 'next/navigation'

type Props = {
  book: { id:string; title:string; author:string; price:number; cover:string }
  uid:  string
}

export default function CheckoutShell({ book, uid }: Props) {
  const router      = useRouter()
  const [loading, s] = useState(false)

  async function pay() {
    s(true)
    /* create Razorpay order ------------------------------------------- */
    const res = await fetch('/api/checkout/create', {
      method:'POST',
      body: JSON.stringify({ bookId: book.id }),
      headers: { 'Content-Type':'application/json' },
    }).then(r => r.json())

    if (!res.orderId) { toast.error('Failed'); return }

    /* launch Razorpay -------------------------------------------------- */
    const rz = new (window as any).Razorpay({
      key:       res.keyId,
      name:      'BookVerse',
      amount:    res.amount,
      currency:  res.currency,
      description: book.title,
      image:     '/favicon.ico',
      order_id:  res.orderId,
      handler:   async (rsp:any) => {
        const v = await fetch('/api/checkout/verify',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            orderId:   rsp.razorpay_order_id,
            paymentId: rsp.razorpay_payment_id,
            signature: rsp.razorpay_signature,
            bookId:    book.id,
            uid,
          }),
        }).then(r=>r.json())

        if (v.ok) {
          toast.success('Payment successful!')
          router.push('/library')
        } else toast.error('Verification failed')
      },
      theme:{ color:'#10b981' },
    })

    rz.open()
    s(false)
  }

  return (
    <>
      {/* Razorpay script once */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="mx-auto max-w-md space-y-6 p-8 text-center">
        <img src={book.cover} alt="" className="mx-auto h-52 rounded-lg shadow" />
        <h1 className="text-2xl font-semibold">{book.title}</h1>
        <p className="text-slate-400">{book.author}</p>

        <p className="text-xl font-semibold">
          ₹{book.price.toLocaleString()}
        </p>

        <button
          onClick={pay}
          disabled={loading}
          className="rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white
                     hover:bg-emerald-400 disabled:opacity-40"
        >
          {loading ? 'Processing…' : 'Pay with Razorpay'}
        </button>
      </div>
    </>
  )
}
