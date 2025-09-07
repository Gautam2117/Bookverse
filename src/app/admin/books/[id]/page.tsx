/*  Admin ▸ Edit-book page
    ──────────────────────────────────────────────────────────── */

import { notFound } from 'next/navigation'
import { adminDb }  from '@/lib/firebase-admin.server'
import BookForm     from '../BookForm'

export const metadata = { title: 'Edit Book │ Admin' }

/**
 * Next.js 15 streams dynamic route params.
 * Accept `params` as a Promise and await it before use.
 * Also, coerce Firestore-specific values to plain JSON before
 * passing them to the client component.
 */
export default async function EditBook(
  { params }: { params: Promise<{ id: string }> },
) {
  /* 0 ▸ unwrap streamed params ----------------------------------------- */
  const { id } = await params

  /* 1 ▸ read the doc ---------------------------------------------------- */
  const snap = await adminDb.doc(`books/${id}`).get()
  if (!snap.exists) notFound()

  const raw = snap.data() as any

  /* 2 ▸ normalise / serialise ------------------------------------------ */
  const book = {
    id          : snap.id,
    title       : raw?.title ?? '',
    author      : raw?.author ?? '',
    description : raw?.description ?? '',
    slug        : raw?.slug ?? '',
    tags        : Array.isArray(raw?.tags) ? raw.tags : [],
    pages       : typeof raw?.pages === 'number' ? raw.pages : 0,
    isPremium   : !!raw?.isPremium,
    priceINR    : typeof raw?.priceINR === 'number' ? raw.priceINR : 0,
    coverPath   : raw?.coverPath ?? null,
    filePathPdf : raw?.filePathPdf ?? null,
    samplePathPdf: raw?.samplePathPdf ?? null,

    /* Firestore Timestamp -> number (ms) for RSC boundary */
    createdAt   : raw?.createdAt?.toMillis ? raw.createdAt.toMillis() : null,
    updatedAt   : raw?.updatedAt?.toMillis ? raw.updatedAt.toMillis() : null,
  }

  /* 3 ▸ render the (client) form --------------------------------------- */
  return <BookForm book={book} />
}
