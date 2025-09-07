// src/components/ReaderWrapper.tsx
"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Elegant fallback while the heavy pdf.js reader bundles
const LoadingPlaceholder = () => (
  <div className="mx-auto flex max-w-xl flex-col items-center gap-3 py-24">
    <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
    <p className="text-sm text-slate-400">Preparing reader…</p>
  </div>
)

const ReaderClient = dynamic(() => import('./ReaderClient'), {
  ssr: false,
  loading: () => <LoadingPlaceholder />, // shown during code‑split load
})

export type ReaderMode = 'preview' | 'read'

interface WrapperProps {
  slug: string
  coverSrc: string
  mode: ReaderMode // preview ≤5 pages, read = full
}

export default function ReaderWrapper({ slug, coverSrc, mode }: WrapperProps) {
  return (
    <ReaderClient
      key={`${mode}:${slug}`}
      slug={slug}
      coverSrc={coverSrc}
      endpoint={mode === 'preview' ? 'preview' : 'read'}
      maxPages={mode === 'preview' ? 5 : Infinity}
    />
  )
}
