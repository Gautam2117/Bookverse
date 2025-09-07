// src/app/auth/AuthShell.tsx  (client component)
'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, AtSign, Lock, LogIn } from 'lucide-react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  getIdToken,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase-client'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthShell() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loadingEmail, setLEmail] = useState(false)
  const [loadingGoogle, setLG] = useState(false)
  const router = useRouter()
  const search = useSearchParams()

  // memoize to avoid re-reading during suspense waterfalls
  const nextPage = useMemo(() => search.get('next') ?? '/library', [search])

  /** Ensure user profile exists */
  const ensureProfile = async (uid: string, email: string, name: string | null) => {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        email,
        displayName: name,
        role: 'user',
        createdAt: serverTimestamp(),
      })
    }
  }

  /** Exchange fresh ID token → secure cookies */
  const setSessionCookie = async () => {
    const idToken = await getIdToken(auth.currentUser!, true) // force refresh
    await fetch('/api/set-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken }),
    })
  }

  /** Email / password */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    const password = String(fd.get('password') || '')
    const confirm = String(fd.get('confirm') || '')

    if (mode === 'signup' && password !== confirm) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setLEmail(true)
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success('Welcome back!')
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await ensureProfile(cred.user.uid, email, cred.user.displayName ?? null)
        toast.success('Account created!')
      }
      await setSessionCookie()
      router.push(nextPage)
    } catch (err: any) {
      toast.error(err?.message ?? 'Authentication error')
    } finally {
      setLEmail(false)
    }
  }

  /** Google OAuth */
  async function handleGoogle() {
    try {
      setLG(true)
      const { user } = await signInWithPopup(auth, googleProvider)
      await ensureProfile(user.uid, user.email!, user.displayName ?? null)
      await setSessionCookie()
      toast.success('Signed in with Google!')
      router.push(nextPage)
    } catch (err: any) {
      toast.error(err?.message ?? 'Google sign-in failed')
    } finally {
      setLG(false)
    }
  }

  const busy = loadingEmail || loadingGoogle

  return (
    <section className="relative isolate overflow-hidden py-24">
      {/* aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/3 left-1/2 h-[45rem] w-[75rem] -translate-x-1/2 rotate-45 bg-[radial-gradient(closest-side,theme(colors.emerald.500/.15),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-1/4 right-1/4 h-[40rem] w-[70rem] -rotate-12 bg-[radial-gradient(closest-side,theme(colors.violet.500/.1),transparent_70%)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-md px-6">
        {/* subtle page-level loading overlay */}
        <AnimatePresence>
          {busy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed inset-0 z-10 bg-black/30 backdrop-blur-sm"
            >
              <div className="flex h-full items-center justify-center">
                <div className="rounded-xl border border-white/10 bg-black/40 px-6 py-4 text-slate-200 shadow">
                  <div className="mx-auto mb-3 h-1 w-40 overflow-hidden rounded bg-white/10">
                    <div className="h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-emerald-400/80" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '120ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur"
          >
            <h1 className="mb-6 text-center font-spectral text-3xl font-semibold">
              {mode === 'signin' ? 'Sign in to BookVerse' : 'Create your account'}
            </h1>

            {/* Google */}
            <div className="mb-6">
              <button
                onClick={handleGoogle}
                disabled={loadingGoogle}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingGoogle ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4 text-emerald-400" />}
                Continue with Google
              </button>
            </div>

            {/* divider */}
            <div className="mb-6 flex items-center gap-4 text-xs uppercase tracking-wide text-slate-500">
              <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
            </div>

            {/* email / pw */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-1 inline-flex items-center gap-1">
                  <AtSign className="h-4 w-4" /> Email
                </span>
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 py-2 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-1 inline-flex items-center gap-1">
                  <Lock className="h-4 w-4" /> Password
                </span>
                <input
                  required
                  type="password"
                  name="password"
                  minLength={6}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 py-2 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </label>

              {mode === 'signup' && (
                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-1 inline-block">Confirm password</span>
                  <input
                    required
                    type="password"
                    name="confirm"
                    minLength={6}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 py-2 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </label>
              )}

              <button
                type="submit"
                disabled={loadingEmail}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingEmail && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              {mode === 'signin' ? "Don't have an account? " : 'Already registered? '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="font-medium text-emerald-400 hover:underline"
              >
                {mode === 'signin' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* tiny keyframes for shimmer (Tailwind-compatible) */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-[shimmer_1.2s_infinite] {
          animation: shimmer 1.2s infinite linear;
        }
      `}</style>
    </section>
  )
}
