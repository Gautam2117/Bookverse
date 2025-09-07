'use client'

import ReaderWrapper from '@/components/ReaderWrapper'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function PreviewShell({
  data,
}: {
  data: { slug: string; cover: string }
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#0d101c] via-[#0e1220] to-[#0f1424] text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b border-white/10 bg-black/40 px-4 backdrop-blur supports-[backdrop-filter]:bg-black/20 lg:px-6">
        <Link
          href="/books"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to library
        </Link>
        <span className="ml-auto text-xs uppercase tracking-wide text-emerald-300">
          Preview mode
        </span>
      </header>

      {/* Reader entrance */}
      <motion.div
        className="flex-1 overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <ReaderWrapper
          key={`preview:${data.slug}`}
          slug={data.slug}
          coverSrc={data.cover}
          mode="preview"
        />
      </motion.div>
    </div>
  )
}
