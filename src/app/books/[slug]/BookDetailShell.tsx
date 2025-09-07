'use client'

import Image   from 'next/image'
import Link    from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useAuth }   from '@/components/AuthProvider'

export type UIBook = {
  id:          string
  slug:        string
  title:       string
  author:      string
  cover:       string
  description?: string
  priceINR:    number
  isPremium:   boolean
  tags:        string[]
}

/* ───────────────────────────────────────────────────────────── */
export default function BookDetailShell({ book }: { book: UIBook }) {
  /* 1 ▸ auth + dynamic CTA ------------------------------------------- */
  const { user } = useAuth()

  const priceLabel = book.isPremium ? `₹${book.priceINR}` : 'Free'

  const buyUrl   = `/checkout/${book.slug}`
  const readerUrl= `/reader/${book.slug}`
  const loginUrl = `/auth?next=${encodeURIComponent(buyUrl)}`

  const ctaHref  = book.isPremium
    ? (user ? buyUrl : loginUrl)              // sign-in first if needed
    : readerUrl

  const ctaLabel = book.isPremium
    ? (user ? 'Buy now' : 'Sign in to buy')
    : 'Read now'

  /* 2 ▸ view ----------------------------------------------------------- */
  return (
    <div className="relative isolate overflow-hidden pb-24 pt-20">
      {/* 🌌  aurora blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/3 left-1/2 h-[50rem] w-[80rem] -translate-x-1/2
                        rotate-45 bg-[radial-gradient(closest-side,
                        theme(colors.violet.500/.15),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-1/4 right-1/4 h-[40rem] w-[70rem] -rotate-12
                        bg-[radial-gradient(closest-side,
                        theme(colors.fuchsia.500/.1),transparent_70%)] blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-12
                      px-6 lg:grid lg:grid-cols-2 lg:gap-20">
        {/* cover */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5, ease: 'easeOut' }}
          className="mx-auto w-full max-w-sm overflow-hidden
                     rounded-3xl shadow-xl shadow-black/30"
        >
          <Image
            src={book.cover}
            alt={book.title}
            width={900}
            height={1200}
            priority
            className="h-auto w-full object-cover"
          />
        </motion.div>

        {/* details */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .6, ease: 'easeOut' }}
          className="flex flex-col justify-center"
        >
          <Link
            href="/books"
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400
                       transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>

          <h1 className="font-spectral text-4xl font-bold tracking-tight
                         md:text-5xl lg:text-6xl">
            {book.title}
          </h1>
          <p className="mt-2 text-base text-slate-400">by {book.author}</p>

          {!!book.tags.length && (
            <div className="mt-5 flex flex-wrap gap-2">
              {book.tags
                .filter(Boolean)
                .map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-violet-600/20 px-2 py-0.5
                               text-[10px] uppercase tracking-wide text-violet-300"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}

          {book.description && (
            <p className="mt-6 leading-relaxed text-slate-300 lg:text-lg">
              {book.description}
            </p>
          )}

          {/* price + CTA */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-semibold text-emerald-300">
              {priceLabel}
            </span>

            <Link
              href={ctaHref}
              prefetch={false}          /* don’t pre-fetch payment flow */
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500
                         px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-500/20
                         transition hover:-translate-y-0.5 hover:bg-emerald-400
                         active:scale-95"
            >
              {ctaLabel}
            </Link>

            <Link
              href={`/preview/${book.slug}`}
              className="inline-flex items-center justify-center rounded-xl border border-white/10
                         px-6 py-3 text-sm font-semibold text-slate-200 transition
                         hover:bg-white/5 active:scale-95"
            >
              Preview
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
