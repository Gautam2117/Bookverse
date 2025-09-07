/*  Admin ▸ Edit-book page
    ──────────────────────────────────────────────────────────── */

import { adminDb } from '@/lib/firebase-admin.server'
import { notFound } from 'next/navigation'
import BookForm     from '../BookForm'

export const metadata = { title: 'Edit Book │ Admin' }

/**
 * Firestore `Timestamp` objects (and a few other Firestore-specific
 * classes) **cannot** be streamed to a Client Component.  
 * We coerce every non-plain value into a JSON-serialisable shape
 * *before* handing the data to `<BookForm/>`.
 */
export default async function EditBook(
  { params }: { params: { id: string } },
) {
  /* 1 ▸ read the doc ----------------------------------------------------- */
  const snap = await adminDb.doc(`books/${params.id}`).get()
  if (!snap.exists) notFound()

  const raw = snap.data()!

  /* 2 ▸ normalise / serialise ------------------------------------------- */
  const book = {
    id         : snap.id,
    title      : raw.title,
    author     : raw.author,
    description: raw.description ?? '',
    slug       : raw.slug,
    tags       : raw.tags ?? [],
    pages      : raw.pages ?? 0,
    isPremium  : !!raw.isPremium,
    priceINR   : raw.priceINR ?? 0,
    coverPath  : raw.coverPath ?? null,
    filePathPdf: raw.filePathPdf ?? null,
    samplePathPdf: raw.samplePathPdf ?? null,

    /* Firestore → number (ms) so it survives RSC → Client boundary */
    createdAt  : raw.createdAt  ? raw.createdAt.toMillis()  : null,
    updatedAt  : raw.updatedAt  ? raw.updatedAt.toMillis()  : null,
  }

  /* 3 ▸ render the (client) form ---------------------------------------- */
  return <BookForm book={book} />
}
