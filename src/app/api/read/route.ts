import { NextRequest } from 'next/server'
import { adminDb, adminStorage } from '@/lib/firebase-admin'
import crypto from 'node:crypto'

export const runtime  = 'nodejs'
export const dynamic  = 'force-dynamic'        // never prerender

/* tiny helpers */
const rangeHdr = (h: string | null, size: number) => {
  if (!h?.startsWith('bytes=')) return null
  const [s, e] = h.replace('bytes=', '').split('-')
  const start  = Number(s)
  const end    = e ? Number(e) : size - 1
  return Number.isNaN(start) || Number.isNaN(end) || start < 0 || end >= size || start > end
    ? null
    : { start, end }
}
const hdrs = (slug: string, etag: string, bytes: number, extra = {}) =>
  ({
    'Content-Type'       : 'application/pdf',
    'Content-Disposition': `inline; filename="${slug}.pdf"`,
    'Cache-Control'      : 'no-store',            // ← avoid ERR_CACHE_WRITE_FAILURE
    'Accept-Ranges'      : 'bytes',
    'X-Endpoint'         : 'read',
    'X-Bytes'            : String(bytes),
    ETag                 : etag,
    ...extra,
  } as Record<string, string>)

export async function GET(req: NextRequest) {
  try {
    /* slug */
    const slug = new URL(req.url).searchParams.get('slug')
    if (!slug) return new Response('Missing ?slug', { status: 400 })

    /* metadata */
    const snap = await adminDb.doc(`books/${slug}`).get()
    if (!snap.exists) return new Response('Not found', { status: 404 })
    const { filePathPdf } = snap.data() as { filePathPdf: string }

    /* Storage */
    const file  = adminStorage.bucket().file(filePathPdf)
    const [ok]  = await file.exists()
    if (!ok) return new Response('PDF not in storage', { status: 404 })

    const [buf] = await file.download()
    const bytes = new Uint8Array(buf)
    const etag  = crypto.createHash('sha1').update(bytes).digest('hex')

    /* 304 */
    if (req.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers: hdrs(slug, etag, 0) })
    }

    /* Range */
    const r = rangeHdr(req.headers.get('range'), bytes.byteLength)
    if (r) {
      const slice = bytes.subarray(r.start, r.end + 1)
      const blob  = new Blob([slice], { type: 'application/pdf' })
      return new Response(blob, {
        status : 206,
        headers: hdrs(slug, etag, slice.byteLength, {
          'Content-Range': `bytes ${r.start}-${r.end}/${bytes.byteLength}`,
        }),
      })
    }

    /* Full */
    return new Response(new Blob([bytes], { type: 'application/pdf' }), {
      status : 200,
      headers: hdrs(slug, etag, bytes.byteLength),
    })
  } catch (e) {
    console.error('[read] fatal', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}
