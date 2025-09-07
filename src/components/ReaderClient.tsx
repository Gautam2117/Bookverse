// src/components/ReaderClient.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  getDocument,
  GlobalWorkerOptions,
  version as pdfjsVersion,
} from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist/types/src/display/api'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`

export type ReaderMode = 'preview' | 'read'

interface Props {
  slug: string
  coverSrc: string
  endpoint: ReaderMode
  maxPages: number
}

export default function ReaderClient({
  slug,
  coverSrc,
  endpoint,
  maxPages,
}: Props) {
  const canvasRef        = useRef<HTMLCanvasElement | null>(null)
  const renderTaskRef    = useRef<RenderTask | null>(null)
  const cache            = useRef<Map<number, HTMLCanvasElement>>(new Map())

  const [pdf,   setPdf]   = useState<PDFDocumentProxy | null>(null)
  const [page,  setPage]  = useState(1)
  const [total, setTotal] = useState(0)
  const [isRendering, setIsRendering] = useState(false)   // ⬅ for fade effect

  /* ---------------- load document ---------------- */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const url = `/api/${endpoint}?slug=${encodeURIComponent(slug)}&_=${endpoint}`
      const doc = await getDocument({ url, rangeChunkSize: 65536 }).promise
      if (cancelled) return
      setPdf(doc)
      setTotal(Math.min(doc.numPages, maxPages))
    })()

    return () => {
      cancelled = true
      renderTaskRef.current?.cancel()
      cache.current.clear()
      setPdf(null)
    }
  }, [slug, endpoint, maxPages])

  /* ---------------- render page ---------------- */
  useEffect(() => {
    if (!pdf) return
    let cancelled = false

    ;(async () => {
      const canvas = canvasRef.current!
      const ctx     = canvas.getContext('2d')!
      setIsRendering(true)

      // cancel any previous render
      renderTaskRef.current?.cancel()

      // 1) cached?
      const cached = cache.current.get(page)
      if (cached) {
        canvas.width  = cached.width
        canvas.height = cached.height
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(cached, 0, 0)
        setIsRendering(false)
        return
      }

      // 2) fresh render
      const pdfPage: PDFPageProxy = await pdf.getPage(page)
      if (cancelled) return

      const viewport = pdfPage.getViewport({ scale: 1.4 })
      canvas.width  = viewport.width
      canvas.height = viewport.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const task = pdfPage.render({ canvasContext: ctx as any, viewport })
      renderTaskRef.current = task
      await task.promise
      if (cancelled) return

      // clone into cache
      const copy = document.createElement('canvas')
      copy.width  = canvas.width
      copy.height = canvas.height
      copy.getContext('2d')!.drawImage(canvas, 0, 0)
      cache.current.set(page, copy)

      setIsRendering(false)

      // 3) preload next
      const next = page + 1
      if (next <= total && !cache.current.has(next)) {
        pdf.getPage(next).then(async p => {
          const v = p.getViewport({ scale: 1.4 })
          const c = document.createElement('canvas')
          c.width = v.width
          c.height = v.height
          await p.render({ canvasContext: c.getContext('2d')!, viewport: v }).promise
          cache.current.set(next, c)
        })
      }
    })()

    return () => {
      cancelled = true
      renderTaskRef.current?.cancel()
    }
  }, [pdf, page, total])

  /* ---------------- UI ---------------- */
  if (!pdf) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-12">
        {coverSrc && (
          <img
            src={coverSrc}
            alt="cover"
            className="w-full max-w-xs rounded-lg blur-sm contrast-75"
          />
        )}
        <Loader2 className="mt-8 h-6 w-6 animate-spin text-emerald-400" />
        <p className="mt-2 text-sm text-slate-400">Fetching pages…</p>
      </div>
    )
  }

  const canPrev = page > 1
  const canNext = page < total

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* controls */}
      <div className="mb-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!canPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(total, p + 1))}
            disabled={!canNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex w-full max-w-xs items-center gap-3">
          <input
            type="range"
            min={1}
            max={total}
            value={page}
            onChange={e => setPage(Number(e.target.value))}
            className="w-full cursor-pointer accent-emerald-400"
          />
          <span className="shrink-0 text-sm tabular-nums text-slate-300">
            {page}/{total}
          </span>
        </div>
      </div>

      {/* single canvas with fade effect */}
      <motion.canvas
        ref={canvasRef}
        animate={{ opacity: isRendering ? 0.3 : 1 }}
        transition={{ duration: 0.25 }}
        className="mx-auto block max-w-full rounded-lg bg-black/5 shadow-lg"
        onContextMenu={e => e.preventDefault()}
      />
    </div>
  )
}
