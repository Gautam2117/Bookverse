// src/app/library/page.tsx
import { listLibraryBooks } from '@/lib/library.server'
import { storagePublicUrl } from '@/utils/storage'
import { getServerUser }   from './auth.server'      // ← new
import LibraryShell from './LibraryShell'

export const metadata = { title: 'My Library — BookVerse' }
export const revalidate = 60

export default async function LibraryPage() {
  const user = await getServerUser()
  const books = await listLibraryBooks(user?.uid ?? null)

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

  return <LibraryShell books={uiBooks} />
}
