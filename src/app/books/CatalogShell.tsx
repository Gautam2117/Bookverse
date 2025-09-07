'use client'

import { useState, useMemo } from 'react'
import BookCard from '@/components/BookCard'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

export default function CatalogShell({ books }: { books: UIBook[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return books
    const q = query.toLowerCase()
    return books.filter(
      b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q),
    )
  }, [books, query])

  return (
    <>
      <div className="relative isolate overflow-hidden py-20">
        {/* gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-1/3 left-1/2 h-[45rem] w-[75rem] -translate-x-1/2 rotate-45 bg-[radial-gradient(closest-side,theme(colors.emerald.500/.15),transparent_70%)] blur-3xl" />
          <div className="absolute -bottom-1/4 right-1/4 h-[40rem] w-[70rem] -rotate-12 bg-[radial-gradient(closest-side,theme(colors.violet.500/.1),transparent_70%)] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          {/* heading + search */}
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="font-spectral text-4xl font-bold tracking-tight md:text-5xl">
              Explore our catalog
            </h2>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title or author…"
                className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-10 text-sm text-slate-200 placeholder:text-slate-500 backdrop-blur focus:border-emerald-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* grid */}
          <AnimatePresence mode="popLayout">
            {filtered.length ? (
              <motion.div
                key="grid"
                layout
                className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4"
              >
                {filtered.map(b => (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BookCard book={b} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center text-slate-400"
              >
                No books match your search.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
