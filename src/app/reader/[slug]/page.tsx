// src/app/reader/[slug]/page.tsx        (🚫 no "use client")
import { Metadata } from 'next'
import { getBookBySlug } from '@/lib/books.server'
import { storagePublicUrl } from '@/utils/storage'
import ReaderShell from './ReaderShell'             // ⬅ client component

export const revalidate = 60

interface ReaderPageProps {
  params: { slug: string }
}

/** SEO */
export async function generateMetadata(
  { params }: ReaderPageProps,
): Promise<Metadata> {
  const book = await getBookBySlug(params.slug)
  return {
    title: book ? `${book.title} – Read | BookVerse` : 'Read | BookVerse',
    description: book
      ? `Dive into “${book.title}” by ${book.author}.`
      : 'Read a book on BookVerse',
  }
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const book = await getBookBySlug(params.slug)
  if (!book) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">Book not found.</div>
    )
  }

  return (
    <ReaderShell
      slug={book.slug}
      coverSrc={
        book.coverPath
          ? storagePublicUrl(book.coverPath)
          : '/placeholder-cover.jpg'
      }
    />
  )
}
