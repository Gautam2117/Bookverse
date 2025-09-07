/*  Checkout page – /checkout/[slug] */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase-admin.server'
import CheckoutShell from '../CheckoutShell'
import { storagePublicUrl } from '@/utils/storage'

export const metadata = { title: 'Checkout │ BookVerse' }

/** Next 15 streams the `params` object – await it before use */
export default async function CheckoutPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  // 0) unwrap streamed params
  const { slug } = await params

  // 1) read cookies (cookies() is async)
  const store = await cookies()
  const uidCookie = store.get('__session_uid')?.value
  const idToken   = store.get('__session')?.value // optional ID-token cookie

  // optional: verify ID token if uid cookie is missing
  let uid = uidCookie ?? null
  if (!uid && idToken) {
    try {
      uid = (await adminAuth.verifyIdToken(idToken)).uid
    } catch {
      /* ignore invalid/expired token */
    }
  }

  // 2) not signed-in → bounce to /auth, preserving “next”
  if (!uid) redirect(`/auth?next=/checkout/${slug}`)

  // 3) fetch book by slug
  const q = await adminDb.collection('books').where('slug', '==', slug).limit(1).get()
  if (q.empty) redirect('/404')

  const snap = q.docs[0]
  const raw = snap.data() as any

  // 4) free books never hit the paid checkout
  if (!raw.isPremium) redirect(`/books/${slug}`)

  // 5) shape data for the client shell
  const book = {
    id: snap.id,
    slug: raw.slug,
    title: raw.title,
    author: raw.author,
    price: Math.max(1, Math.round(raw.priceINR)), // ₹
    cover: raw.coverPath ? storagePublicUrl(raw.coverPath) : '/placeholder-cover.jpg',
  }

  return <CheckoutShell book={book} uid={uid} />
}
