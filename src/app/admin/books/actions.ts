'use server'

import { revalidatePath }   from 'next/cache'
import { adminDb, adminStorage } from '@/lib/firebase-admin.server'
import { randomUUID } from 'node:crypto'

/* ── helpers ──────────────────────────────────────────────────────────── */
// generate a Storage path that never collides
const genPath = (folder: string, file: File) =>
  `${folder}/${randomUUID()}_${file.name.replace(/\s+/g, '_')}`

// upload a browser-`File` (via FormData) to Storage and return the gs:// path
async function uploadFile(folder: string, file: File | null) {
  if (!file) return null
  const bucket = adminStorage.bucket()
  const path   = genPath(folder, file)

  await bucket.file(path).save(Buffer.from(await file.arrayBuffer()), {
    metadata: { contentType: file.type },
    resumable: false,
  })
  return path            // keep only the internal path, not the download URL
}

/* ── upsert (create / update) ─────────────────────────────────────────── */
export async function upsertBook(prev: any, formData: FormData) {
  try {
    /* ---------- 1. read scalar fields from formData ---------- */
    const id          = formData.get('id') as string | null
    const title       = formData.get('title')?.toString().trim()
    const author      = formData.get('author')?.toString().trim()
    const slug        = formData.get('slug')?.toString().trim()
    const description = formData.get('description')?.toString() ?? ''
    const priceINR    = Number(formData.get('priceINR') ?? 0)
    const isPremium   = formData.get('isPremium') === 'on'
    const pages       = Number(formData.get('pages') ?? 0)
    const tags        = formData.getAll('tags').map(t => t.toString().trim()).filter(Boolean)

    /* ---------- 2. handle files (if any) ---------- */
    const coverFile = formData.get('coverFile') as File | null
    const pdfFile   = formData.get('pdfFile')   as File | null
    const samplePdf = formData.get('samplePdf') as File | null

    const [coverPath, filePathPdf, samplePathPdf] = await Promise.all([
      uploadFile('covers', coverFile),
      uploadFile('books',  pdfFile),
      uploadFile('samples', samplePdf),
    ])

    /* ---------- 3. build Firestore payload ---------- */
    const data = {
      title, author, slug, description,
      priceINR, isPremium, pages, tags,
      ...(coverPath     ? { coverPath }     : {}),
      ...(filePathPdf   ? { filePathPdf }   : {}),
      ...(samplePathPdf ? { samplePathPdf } : {}),
      updatedAt: new Date(),
      ...(id ? {} : { createdAt: new Date() }),
    }

    /* ---------- 4. write ---------- */
    const col = adminDb.collection('books')
    const ref = id ? col.doc(id) : col.doc()

    await ref.set(data, { merge: true })
    revalidatePath('/admin/books')          // refresh list

    return { ok: true, id: ref.id }
  } catch (e) {
    console.error('[upsertBook] failed', e)
    return { ok: false }
  }
}

/* ── delete ───────────────────────────────────────────────────────────── */
export async function deleteBook(id: string) {
  try {
    const ref  = adminDb.doc(`books/${id}`)
    const snap = await ref.get()
    if (!snap.exists) return false

    /* clean Storage files (best-effort) */
    const { coverPath, filePathPdf, samplePathPdf } = snap.data() as any
    const bucket = adminStorage.bucket()
    await Promise.all(
      [coverPath, filePathPdf, samplePathPdf]
        .filter(Boolean)
        .map((p: string) => bucket.file(p).delete({ ignoreNotFound: true })),
    )

    await ref.delete()
    revalidatePath('/admin/books')
    return true
  } catch (e) {
    console.error('[deleteBook] failed', e)
    return false
  }
}
