// src/app/auth/page.tsx  (server component)
import { Suspense } from 'react'
import AuthShell from './AuthShell'

export const metadata = { title: 'Sign in – BookVerse' }
export const dynamic = 'force-dynamic' // don't prerender; we rely on client hooks

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthShell />
    </Suspense>
  )
}

/* ——— Fancy loading fallback (server-rendered) ——— */
function AuthLoading() {
  return (
    <section className="relative isolate overflow-hidden py-24">
      {/* aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/3 left-1/2 h-[45rem] w-[75rem] -translate-x-1/2 rotate-45 bg-[radial-gradient(closest-side,theme(colors.emerald.500/.15),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-1/4 right-1/4 h-[40rem] w-[70rem] -rotate-12 bg-[radial-gradient(closest-side,theme(colors.violet.500/.10),transparent_70%)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-md px-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur">
          <div className="mb-6 h-7 w-48 animate-pulse rounded bg-white/10" />

          {/* card skeleton */}
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded-xl bg-white/5" />
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-wide text-slate-500">or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-white/5" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-white/5" />
            <div className="h-10 w-2/3 animate-pulse rounded-lg bg-white/5" />
          </div>

          {/* bouncing dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '120ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '240ms' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
