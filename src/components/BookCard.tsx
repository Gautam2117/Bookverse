// src/components/BookCard.tsx
"use client"

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export type Book = {
  id: string
  slug: string
  title: string
  author: string
  cover: string
  priceINR: number
  isPremium: boolean
  tags: string[]
}

export default function BookCard({ book }: { book: Book }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <Link href={`/books/${book.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 via-white/0 to-white/0 shadow-lg shadow-black/20 backdrop-blur-md transition-transform">
          {/* Cover */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={book.cover}
              alt={book.title}
              width={600}
              height={800}
              priority={false}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Premium ribbon */}
            {book.isPremium && (
              <span className="absolute left-2 top-2 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black shadow lg:text-[11px]">
                Premium
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="p-4">
            <h3 className="line-clamp-1 font-medium leading-snug tracking-tight text-slate-100 lg:text-base">
              {book.title}
            </h3>
            <p className="line-clamp-1 text-sm text-slate-400">{book.author}</p>

            <div className="mt-3 flex items-center justify-between">
              {/* Tags */}
              <div className="flex gap-2">
                {book.tags.slice(0, 2).map(t => (
                  <span
                    key={t}
                    className="rounded-full bg-violet-600/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-violet-300"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Price */}
              <span className="text-sm font-semibold text-emerald-300">
                {book.isPremium ? `₹${book.priceINR}` : 'Free'}
              </span>
            </div>
          </div>

          {/* Hover glow */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/10 via-fuchsia-400/10 to-transparent blur-lg" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
