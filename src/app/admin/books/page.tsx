/*  Admin ▸ Books list  */
import { adminDb }       from '@/lib/firebase-admin.server'
import Link              from 'next/link'
import { deleteBook }    from './actions'

export const metadata = { title: 'Books │ Admin' }

/* helper so we can call the server action inline */
async function handleDelete(id: string, formData: FormData) {
  'use server'
  await deleteBook(id)
}

export default async function BooksAdmin() {
  const snap = await adminDb.collection('books').orderBy('createdAt', 'desc').get()

  const rows = snap.docs.map(d => {
    const r = d.data()
    return {
      id: d.id,
      title: r.title,
      author: r.author,
      priceINR: r.priceINR ?? 0,
      isPremium: !!r.isPremium,
      createdAt: r.createdAt ? r.createdAt.toMillis() : null,
    }
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Books</h2>
        <Link
          href="/admin/books/new"
          className="rounded bg-emerald-500 px-4 py-1.5 text-sm font-medium hover:bg-emerald-400"
        >
          + New
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead className="border-b border-white/10 text-left">
          <tr>
            <th className="py-2">Title</th>
            <th>Author</th>
            <th className="text-right">Price</th>
            <th className="text-right">Premium</th>
            <th className="text-right">Created</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {rows.map(b => (
            <tr key={b.id} className="border-b border-white/5 last:border-none">
              <td className="py-2">
                <Link href={`/admin/books/${b.id}`} className="hover:underline">
                  {b.title}
                </Link>
              </td>
              <td>{b.author}</td>
              <td className="text-right">{b.priceINR}</td>
              <td className="text-right">{b.isPremium ? '✓' : ''}</td>
              <td className="text-right">
                {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
              </td>
              <td className="w-1 whitespace-nowrap pl-3">
                <form action={handleDelete.bind(null, b.id)}>
                  <button className="text-rose-400 hover:underline">delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
