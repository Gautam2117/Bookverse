import { listBooks } from './books.server'
import { adminDb }   from './firebase-admin.server'

export async function listLibraryBooks(userId: string | null) {
  const all = await listBooks()

  // Signed-out → free books only
  if (!userId) return all.filter(b => !b.isPremium)

  // Signed-in → look up purchases
  const snap = await adminDb
    .collection('users')
    .doc(userId)
    .collection('library')
    .get()

  const purchasedIds = snap.docs.map(d => d.id)

  // Merge free books + purchased premiums
  return all.filter(b => !b.isPremium || purchasedIds.includes(b.id))
}
