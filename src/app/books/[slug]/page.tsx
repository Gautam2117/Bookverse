import { Metadata } from 'next'
import { getBookBySlug } from '@/lib/books.server'
import { storagePublicUrl } from '@/utils/storage'
import BookDetailShell from './BookDetailShell' // client component

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> } // ← streamed params

/** Dynamic SEO */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params // ✅ await the streamed object
  const book = await getBookBySlug(slug)

  return {
    title: book ? `${book.title} – Book | BookVerse` : 'Book | BookVerse',
    description: book
      ? `${book.description?.slice(0, 120)}…`
      : 'Book details on BookVerse',
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params // ✅ await here too
  const book = await getBookBySlug(slug)

  if (!book) {
    return <div className="mx-auto max-w-6xl px-4 py-10">Book not found.</div>
  }

  const uiBook = {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    description: book.description,
    cover: book.coverPath ? storagePublicUrl(book.coverPath) : '/placeholder-cover.jpg',
    priceINR: book.priceINR,
    isPremium: book.isPremium,
    tags: book.tags ?? [],
  }

  return <BookDetailShell book={uiBook} />
}
