// server-only Firestore helpers
import { adminDb } from '@/lib/firebase-admin.server'

export type BookDoc = {
  id: string
  slug: string
  title: string
  author: string
  coverPath: string | null
  filePathPdf: string
  priceINR: number
  isPremium: boolean
  tags?: string[]
  description?: string
}

export async function listBooks(limit = 50): Promise<BookDoc[]> {
  let q = adminDb.collection('books').orderBy('createdAt', 'desc')
  if (limit) q = q.limit(limit) as any
  const snap = await q.get()
  return snap.docs.map(d => toBook(d.id, d.data() as any))
}

export async function getBookBySlug(slug: string): Promise<BookDoc | null> {
  const doc = await adminDb.doc(`books/${slug}`).get()
  return doc.exists ? toBook(doc.id, doc.data() as any) : null
}

/* internal */
function toBook(id: string, x: any): BookDoc {
  return {
    id,
    slug        : x.slug ?? id,
    title       : x.title,
    author      : x.author ?? 'Unknown',
    coverPath   : x.coverPath ?? null,
    filePathPdf : x.filePathPdf,
    priceINR    : x.priceINR ?? 0,
    isPremium   : !!x.isPremium,
    tags        : x.tags ?? [],
    description : x.description ?? '',
  }
}
