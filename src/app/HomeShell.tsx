// src/app/HomeShell.tsx
'use client'

import BookCard from '@/components/BookCard'
import Link from 'next/link'
import { motion } from 'framer-motion'

export type UIBook = {
  id: string
  slug: string
  title: string
  author: string
  cover: string
  priceINR: number
  isPremium: boolean
  tags: string[]
}

export default function HomeShell({ books }: { books: UIBook[] }) {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative isolate overflow-hidden pt-24 md:pt-32">
        {/* Aurora blobs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2 rotate-45 bg-[radial-gradient(closest-side,theme(colors.emerald.400/.25),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-1/4 h-[30rem] w-[50rem] -rotate-12 bg-[radial-gradient(closest-side,theme(colors.fuchsia.500/.15),transparent_70%)] blur-3xl" />

        {/* HERO CONTENT */}
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-32 md:grid-cols-2 lg:gap-24">
          {/* Copy */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">
              New • Curated • Beautiful
            </p>

            <h1 className="mt-4 font-spectral text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Stories that feel like{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-400 to-rose-400">
                home
              </span>
              .
            </h1>

            <p className="mt-6 max-w-lg text-lg text-slate-300/90">
              Lose yourself in gorgeously crafted e-books. Free picks for
              everyone — premium editions for collectors.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/books"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring focus-visible:ring-emerald-500/40 active:scale-95"
              >
                Browse books
              </Link>
              <a
                href="#featured"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-400/40 active:scale-95"
              >
                View featured
              </a>
            </div>
          </motion.div>

          {/* Covers grid */}
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:place-self-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          >
            {books.map((b, idx) => (
              <motion.div
                key={b.id}
                whileHover={{ translateY: -6, rotate: idx % 2 ? 1.5 : -1.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="[perspective:1000px]"
              >
                <BookCard book={b} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------------- FEATURED ---------------- */}
      <section id="featured" className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="mb-8 font-spectral text-3xl font-semibold tracking-tight md:text-4xl">
          Featured this week
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map(b => (
            <BookCard key={`featured-${b.id}`} book={b} />
          ))}
        </div>
      </section>
    </>
  )
}
