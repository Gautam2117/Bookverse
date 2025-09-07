// src/app/preview/[slug]/page.tsx
import { Metadata } from 'next'
import { getBookBySlug } from '@/lib/books.server'
import { storagePublicUrl } from '@/utils/storage'
import PreviewShell from './PreviewShell'           // ⬅ client component

export const revalidate = 60

interface PreviewProps {
  params: { slug: string }
}

/** SEO */
export async function generateMetadata(
  { params }: PreviewProps,
): Promise<Metadata> {
  const book = await getBookBySlug(params.slug)
  return {
    title: book ? `${book.title} – Preview | BookVerse` : 'Preview | BookVerse',
    description: book
      ? `Read a free preview of “${book.title}” by ${book.author}.`
      : 'Preview a book on BookVerse',
  }
}

export default async function PreviewPage({ params }: PreviewProps) {
  const book = await getBookBySlug(params.slug)
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
