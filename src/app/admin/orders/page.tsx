/*  src/app/admin/orders/page.tsx  */
import { adminDb }           from '@/lib/firebase-admin.server'
import { Timestamp }         from 'firebase-admin/firestore'

export const metadata = { title: 'Orders │ Admin' }

/* ───────────────────────────────────────────────────────────── */
export default async function OrdersAdmin() {
  /* 1 ▸ Fetch purchases --------------------------------------------------- */
  const purSnap = await adminDb
    .collection('purchases')
    .orderBy('purchasedAt', 'desc')
    .get()

  const orders = purSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))

  if (!orders.length) {
    return <p className="text-slate-400">No orders yet.</p>
  }

  /* 2 ▸ Collect user / book IDs ------------------------------------------ */
  const userIds = [...new Set(orders.map((o) => o.userId))].filter(Boolean)
  const bookIds = [...new Set(orders.map((o) => o.bookId))].filter(Boolean)

  /* 3 ▸ Batch-get related docs (skip if none) ----------------------------- */
  const [usersSnap, booksSnap] = await Promise.all([
    userIds.length
      ? adminDb.getAll(...userIds.map((id) => adminDb.doc(`users/${id}`)))
      : ([] as any[]),
    bookIds.length
      ? adminDb.getAll(...bookIds.map((id) => adminDb.doc(`books/${id}`)))
      : ([] as any[]),
  ])

  /* 4 ▸ Build lookup maps ------------------------------------------------- */
  const usersMap = Object.fromEntries(
    usersSnap.map((doc) => [
      doc.id,
      { email: doc.get('email'), name: doc.get('displayName') },
    ]),
  )

  const booksMap = Object.fromEntries(
    booksSnap.map((doc) => [doc.id, { title: doc.get('title') }]),
  )

  /* 5 ▸ Render ------------------------------------------------------------ */
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Orders</h2>

      <table className="w-full text-sm">
        <thead className="border-b border-white/10 text-left">
          <tr>
            <th className="py-2">Date</th>
            <th>User</th>
            <th>Book</th>
            <th className="text-right">Amount&nbsp;(₹)</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => {
            const user = usersMap[o.userId] ?? {}
            const book = booksMap[o.bookId] ?? {}
            return (
              <tr key={o.id} className="border-b border-white/5 last:border-none">
                <td className="py-2">{formatDate(o.purchasedAt)}</td>
                <td>{user.name || user.email || o.userId}</td>
                <td>{book.title || o.bookId}</td>
                <td className="text-right">{o.priceINR}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* helper ------------------------------------------------------------------ */
function formatDate(ts: Timestamp | string | number) {
  const d = ts instanceof Timestamp ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}
