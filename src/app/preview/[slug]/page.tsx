// src/app/preview/[slug]/page.tsx
import type { Metadata } from 'next'
import { getBookBySlug } from '@/lib/books.server'
import { storagePublicUrl } from '@/utils/storage'
import PreviewShell from './PreviewShell' // client component

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> } // Next 15 streams params

/** SEO */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = await getBookBySlug(slug)

  return {
    title: book ? `${book.title} – Preview | BookVerse` : 'Preview | BookVerse',
    description: book
      ? `Read a free preview of “${book.title}” by ${book.author}.`
      : 'Preview a book on BookVerse',
  }
}

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params
  const book = await getBookBySlug(slug)

  if (!book) {
    return <div className="mx-auto max-w-6xl px-4 py-10">Book not found.</div>
  }

  const uiData = {
    slug: book.slug,
    cover: book.coverPath
      ? storagePublicUrl(book.coverPath)
      : '/placeholder-cover.jpg',
  }

  return <PreviewShell data={uiData} />
}
