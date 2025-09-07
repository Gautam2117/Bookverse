'use client'

import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import ReaderWrapper from '@/components/ReaderWrapper'

export default function ReaderShell({
  slug,
  coverSrc,
}: {
  slug: string
  coverSrc: string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  // progress bar driven by scroll inside wrapper
  const { scrollYProgress } = useScroll({ container: wrapperRef })
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 20,
  })

  return (
    <motion.div
      className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#0c101c] via-[#0d1220] to-[#0e1323] text-slate-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top progress bar */}
      <motion.div
        className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-emerald-400"
        style={{ scaleX: progress }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-black/40 px-4 backdrop-blur supports-[backdrop-filter]:bg-black/20 lg:px-6">
        <Link
          href="/books"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" /> Library
        </Link>
        <Link
          href={`/books/${slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-400"
        >
          Details <Info className="h-4 w-4" />
        </Link>
      </header>

      {/* Reader */}
      <div ref={wrapperRef} className="flex-1 overflow-y-auto">
        <ReaderWrapper
          key={`read:${slug}`}
          slug={slug}
          coverSrc={coverSrc}
          mode="read"
        />
      </div>
    </motion.div>
  )
}
