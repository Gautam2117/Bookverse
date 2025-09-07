// src/app/books/page.tsx   (🚫 DO NOT add "use client")
import { listBooks } from '@/lib/books.server'
import { storagePublicUrl } from '@/utils/storage'
import CatalogShell from './CatalogShell'          // ⬅ client component

export const metadata = { title: 'Catalog — BookVerse' }
export const revalidate = 60

export default async function BooksPage() {
  const books = await listBooks()

  const uiBooks = books.map(b => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    author: b.author,
    cover: b.coverPath
      ? storagePublicUrl(b.coverPath)
      : '/placeholder-cover.jpg',
    priceINR: b.priceINR,
    isPremium: b.isPremium,
    tags: b.tags ?? [],
  }))

  return <CatalogShell books={uiBooks} />
}
