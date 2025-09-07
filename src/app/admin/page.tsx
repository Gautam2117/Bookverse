import { adminDb } from '@/lib/firebase-admin.server'

export default async function Dashboard() {
  const [booksSnap, usersSnap, ordersSnap] = await Promise.all([
    adminDb.collection('books').get(),
    adminDb.collection('users').get(),
    adminDb.collection('purchases').get(),
  ])

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <StatCard label="Books"   value={booksSnap.size} />
      <StatCard label="Users"   value={usersSnap.size} />
      <StatCard label="Orders"  value={ordersSnap.size} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  )
}
