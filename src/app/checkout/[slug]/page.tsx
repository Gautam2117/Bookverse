/*  Checkout page – /checkout/[slug]
    Server component (no "use client")
    - Next 15 streams dynamic route params → await them
    - cookies() is async → await it
    - Avoid caching so auth/cookies are read fresh
*/

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase-admin.server'
import CheckoutShell from '../CheckoutShell'
import { storagePublicUrl } from '@/utils/storage'

export const metadata = { title: 'Checkout │ BookVerse' }

/** Ensure this page always runs on the server and is never cached */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export default async function CheckoutPage({ params }: Props) {
  // 0) unwrap streamed params
  const { slug } = await params

  // 1) read cookies (cookies() is async in Next 15)
  const store = await cookies()
  const uidCookie = store.get('__session_uid')?.value ?? null
  const idToken   = store.get('__session')?.value ?? null // Firebase ID token (optional)

  // 2) derive uid (prefer explicit uid cookie; fall back to verifying ID token)
  let uid: string | null = uidCookie
  if (!uid && idToken) {
    try {
      // checkRevoked=false → fewer failures if token is old but valid
      const decoded = await adminAuth.verifyIdToken(idToken, false)
      uid = decoded.uid
    } catch {
      // invalid/expired token → treat as signed-out
      uid = null
    }
  }

  // 3) not signed-in → bounce to /auth, preserving “next”
  if (!uid) {
    redirect(`/auth?next=/checkout/${encodeURIComponent(slug)}`)
  }

  // 4) fetch book by slug
  const q = await adminDb
    .collection('books')
    .where('slug', '==', slug)
    .limit(1)
    .get()

  if (q.empty) redirect('/404')

  const snap = q.docs[0]
  const raw  = snap.data() as any

  // 5) free books never hit the paid checkout (send to reader)
  if (!raw.isPremium) {
    redirect(`/reader/${slug}`)
  }

  // 6) shape data for the client shell (plain JSON only)
  const book = {
    id:     snap.id,
    slug:   raw.slug as string,
    title:  raw.title as string,
    author: raw.author as string,
    price:  Math.max(1, Math.round(Number(raw.priceINR) || 0)), // ₹
    cover:  raw.coverPath ? storagePublicUrl(raw.coverPath) : '/placeholder-cover.jpg',
  }

  return <CheckoutShell book={book} uid={uid} />
}
