// src/app/page.tsx  (server component)
import { listBooks } from '@/lib/books.server'
import { storagePublicUrl } from '@/utils/storage'
import HomeShell from './HomeShell'

export const revalidate = 60

export default async function Page() {
  const books = await listBooks(3)

  // map ONLY the fields HomeShell cares about
  const uiBooks = books.map(b => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    author: b.author,
    cover: b.coverPath ? storagePublicUrl(b.coverPath) : '/placeholder-cover.jpg',
    priceINR: b.priceINR,
    isPremium: b.isPremium,
    tags: b.tags ?? [],              // ensure array, never undefined
  }))

  return <HomeShell books={uiBooks} />
}
