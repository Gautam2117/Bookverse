'use client'

import BookCard from '@/components/BookCard'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

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

export default function LibraryShell({ books }: { books: UIBook[] }) {
  const { user } = useAuth()

  return (
    <section className="relative isolate overflow-hidden py-24">
      {/* gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/3 left-1/2 h-[45rem] w-[75rem] -translate-x-1/2 rotate-45 bg-[radial-gradient(closest-side,theme(colors.emerald.500/.15),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-1/4 right-1/4 h-[40rem] w-[70rem] -rotate-12 bg-[radial-gradient(closest-side,theme(colors.violet.500/.1),transparent_70%)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <h1 className="mb-10 font-spectral text-4xl font-semibold tracking-tight md:text-5xl">
          My Library
        </h1>

        <AnimatePresence mode="popLayout">
          {books.length ? (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
            >
              {books.map(b => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
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
              className="py-24 text-center text-slate-400"
            >
              {user ? (
                <>Your library is empty. Browse the&nbsp;
                <Link href="/books" className="text-emerald-400 underline">
                  catalog
                </Link>{' '}
                to add books!</>
              ) : (
                <>Sign in to see your purchased books.&nbsp;
                <Link href="/auth" className="text-emerald-400 underline">
                  Sign in
                </Link>
                </>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
