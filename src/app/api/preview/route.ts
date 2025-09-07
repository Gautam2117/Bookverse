// app/api/preview/route.ts
import { NextRequest } from 'next/server'
import { adminDb, adminStorage } from '@/lib/firebase-admin'
import { PDFDocument } from 'pdf-lib'
import crypto from 'node:crypto'

export const runtime  = 'nodejs'        // ensure Node runtime
export const dynamic  = 'force-dynamic' // always produce fresh response

/* ------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------ */

/** Parse an HTTP Range header: `bytes=START-END` */
function parseRange(header: string | null, size: number) {
  if (!header?.startsWith('bytes=')) return null
  const [startStr, endStr] = header.replace('bytes=', '').split('-')
  const start = Number(startStr)
  const end   = endStr ? Number(endStr) : size - 1
  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    end >= size ||
    start > end
  )
    return null

  return { start, end }
}

/** Build a Response with the correct headers for a PDF slice */
function pdfResponse(
  body: Uint8Array | Buffer,
  opt: {
    status: 200 | 206 | 304
    etag: string
    slug: string
    total?: number        // total file size (only for 206)
    range?: { start: number; end: number } // only for 206
  },
) {
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/pdf',
    ETag: opt.etag,
    'Cache-Control': 'public, max-age=60, s-maxage=60',
    'Content-Disposition': `inline; filename="${opt.slug}.pdf"`,
  }

  if (opt.status === 206 && opt.range && typeof opt.total === 'number') {
    baseHeaders['Content-Range'] = `bytes ${opt.range.start}-${opt.range.end}/${opt.total}`
    baseHeaders['Accept-Ranges'] = 'bytes'
    baseHeaders['Content-Length'] = String(body.byteLength)
  } else if (opt.status === 200) {
    baseHeaders['Accept-Ranges'] = 'bytes'
    baseHeaders['Content-Length'] = String(body.byteLength)
  }

  // Convert Buffer to Uint8Array for Response API compatibility
  const buf = Buffer.isBuffer(body) ? new Uint8Array(body) : new Uint8Array(Buffer.from(body))
  return new Response(buf, { status: opt.status, headers: baseHeaders })
}

/* ------------------------------------------------------------ *
 * GET /api/preview?slug=<book-slug>
 * ------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  try {
    /* -------- 0. required slug param ---------- */
    const slug = new URL(req.url).searchParams.get('slug')
    if (!slug) return new Response('Missing ?slug', { status: 400 })

    /* -------- 1. Firestore metadata ---------- */
    const snap = await adminDb.doc(`books/${slug}`).get()
    if (!snap.exists) return new Response('Not found', { status: 404 })
    const { filePathPdf, samplePathPdf } = snap.data() as {
     filePathPdf: string
     samplePathPdf?: string | null
   }
    // If you’ve already pre-generated a 5-page sample, use it; else use full PDF
    const storagePath = samplePathPdf ?? filePathPdf
    /* -------- 2. Download from Cloud Storage ---------- */
    const [buf] = await adminStorage.bucket().file(storagePath).download()
    let bytes: Uint8Array = buf // pass as Uint8Array to pdf-lib

    /* -------- 3. On-the-fly 5-page preview (if needed) ---------- */
    if (!samplePathPdf) {
      const src = await PDFDocument.load(bytes)
      const dst = await PDFDocument.create()
      const n   = Math.min(5, src.getPageCount())
      const pages = await dst.copyPages(src, [...Array(n).keys()])
      pages.forEach(p => dst.addPage(p))
      bytes = await dst.save() // still Uint8Array
    }

    /* -------- 4. ETag / 304 short-circuit ---------- */
    const etag = crypto.createHash('sha1').update(bytes).digest('hex')
    if (req.headers.get('if-none-match') === etag) {
      return pdfResponse(Buffer.alloc(0), {
        status: 304,
        etag,
        slug,
      })
    }

    /* -------- 5. Range support ---------- */
    const range = parseRange(req.headers.get('range'), bytes.byteLength)
    if (range) {
      const chunk = bytes.subarray(range.start, range.end + 1)
      return pdfResponse(chunk, {
        status: 206,
        etag,
        slug,
        total: bytes.byteLength,
        range,
      })
    }

    /* -------- 6. Full document ---------- */
    return pdfResponse(bytes, {
      status: 200,
      etag,
      slug,
    })
  } catch (err) {
    console.error('[preview] error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
