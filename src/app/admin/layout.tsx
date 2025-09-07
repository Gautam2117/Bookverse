/*  src/app/admin/layout.tsx  */
import { Inter } from 'next/font/google'
import Link       from 'next/link'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = { title: 'Admin │ BookVerse' }

/* ────────────────────────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      /* live inside the <body> that RootLayout already renders */
      className={`flex min-h-screen bg-[#0c101c] text-slate-100 ${inter.variable}`}
    >
      {/* ── left side-nav ─────────────────────────────────── */}
      <aside className="flex h-screen w-56 flex-col border-r border-white/10 bg-black/40 px-4 py-6">
        <h1 className="mb-8 inline-flex items-center gap-1 text-xl font-semibold">
          BookVerse <span className="text-emerald-400">Admin</span>
        </h1>

        <nav className="space-y-2 text-sm text-slate-300">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/books">Books</NavLink>
          <NavLink href="/admin/users">Users</NavLink>
          <NavLink href="/admin/orders">Orders</NavLink>
        </nav>
      </aside>

      {/* ── main scroll area ─────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}

/* simple Link helper (no client-side pathname logic = no “use client”) */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="block rounded px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  )
}
