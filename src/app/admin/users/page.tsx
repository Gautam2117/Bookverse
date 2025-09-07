import { adminDb } from '@/lib/firebase-admin.server'

export const metadata = { title: 'Users │ Admin' }

export default async function UsersAdmin() {
  const snap = await adminDb.collection('users').get()
  const users = snap.docs.map(d => ({ id: d.id, ...d.data() } as any))

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Users</h2>

      <table className="w-full text-sm">
        <thead className="border-b border-white/10 text-left">
          <tr>
            <th className="py-2">UID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-white/5 last:border-none">
              <td className="py-2 font-mono text-xs">{u.id}</td>
              <td>{u.displayName ?? '—'}</td>
              <td>{u.email}</td>
              <td>{u.role ?? 'user'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
