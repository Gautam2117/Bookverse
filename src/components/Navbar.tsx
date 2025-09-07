'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Library,
  LogIn,
  LogOut,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  const isAdmin  = profile?.role === 'admin'

  const navLinks = [
    { href: '/books',   label: 'Catalog' },
    { href: '/library', label: 'Library', icon: Library },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  /* --------------------------- JSX --------------------------- */
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur
                       supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">

        {/* logo */}
        <Link href="/" className="group inline-flex items-center gap-2 text-slate-100">
          <BookOpen className="h-6 w-6 transition-transform group-hover:-rotate-6 group-hover:scale-105" />
          <span className="font-spectral text-lg font-semibold tracking-wider">BookVerse</span>
          <span className="ml-2 rounded-full bg-violet-600/25 px-2 py-0.5 text-[10px] uppercase
                           tracking-wide text-violet-200">beta</span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white">
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </Link>
          ))}

          {/* store */}
          <Link href="/#"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10
                           bg-white/5 px-3 py-1.5 text-slate-200 transition
                           hover:bg-white/10 hover:text-white">
            <ShoppingBag className="h-4 w-4" /> Store
          </Link>

          {/* auth */}
          {user ? (
            <button onClick={signOut}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10
                               bg-white/5 px-3 py-1.5 text-slate-200 transition
                               hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" /> Sign&nbsp;out
            </button>
          ) : (
            <Link href="/auth"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10
                             bg-white/5 px-3 py-1.5 text-slate-200 transition
                             hover:bg-white/10 hover:text-white">
              <LogIn className="h-4 w-4" /> Sign&nbsp;in
            </Link>
          )}
        </nav>

        {/* hamburger */}
        <button className="md:hidden" onClick={() => setOpen(p => !p)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile" initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: .25, ease: 'easeInOut' }}
            className="md:hidden border-t border-white/10 bg-black/60 backdrop-blur px-4 pb-4 pt-2"
          >
            <ul className="space-y-3 text-sm text-slate-200">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2
                                   transition-colors hover:bg-white/5 hover:text-white">
                    {Icon && <Icon className="h-4 w-4" />}
                    {label}
                  </Link>
                </li>
              ))}

              <li>
                <Link href="/#" onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg border border-white/10
                                 bg-white/5 px-2 py-2 text-slate-200 transition
                                 hover:bg-white/10 hover:text-white">
                  <ShoppingBag className="h-4 w-4" /> Store
                </Link>
              </li>

              <li>
                {user ? (
                  <button
                    onClick={() => { signOut(); setOpen(false) }}
                    className="flex w-full items-center gap-2 rounded-lg border border-white/10
                               bg-white/5 px-2 py-2 text-slate-200 transition
                               hover:bg-white/10 hover:text-white">
                    <LogOut className="h-4 w-4" /> Sign&nbsp;out
                  </button>
                ) : (
                  <Link href="/auth" onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-lg border border-white/10
                                   bg-white/5 px-2 py-2 text-slate-200 transition
                                   hover:bg-white/10 hover:text-white">
                    <LogIn className="h-4 w-4" /> Sign&nbsp;in
                  </Link>
                )}
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
