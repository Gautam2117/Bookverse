// src/app/layout.tsx            (server component – no "use client")

import '@/styles/globals.css'
import { Inter, Spectral } from 'next/font/google'
import { Toaster } from 'sonner'
import Navbar from '@/components/Navbar'   // ← single source of truth
import FadeIn from '@/components/FadeIn'
import AuthProvider from '@/components/AuthProvider'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-spectral',
})

export const metadata = {
  title: 'BookVerse — Discover Your Next Favourite Book',
  description:
    'A beautifully-crafted bookstore where you can read, download & own amazing titles.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spectral.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#121826] to-[#1b2135] text-slate-100 antialiased selection:bg-emerald-400/25"
        suppressHydrationWarning
      >
        {/* Starfield background */}
        <div className="pointer-events-none fixed inset-0 z-0 [mask-image:radial-gradient(circle_at_center,white,transparent)]">
          <div className="absolute inset-0 animate-starfield bg-[url('/images/stars.svg')] opacity-40" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <AuthProvider>
            {/* ---------- HEADER ---------- */}
            <Navbar />

            {/* ---------- MAIN ---------- */}
            <FadeIn>{children}</FadeIn>
          </AuthProvider>
          {/* ---------- FOOTER ---------- */}
          <footer className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} BookVerse. All rights reserved.
              </p>

              <div className="flex gap-4">
                <Link
                  href="https://twitter.com"
                  className="hover:text-emerald-400"
                  aria-label="Twitter"
                >
                  {/* swap for an icon component if desired */}
                  <svg
                    className="h-5 w-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.29 4.29 0 0 0 1.88-2.37 8.62 8.62 0 0 1-2.72 1.04 4.27 4.27 0 0 0-7.29 3.89A12.1 12.1 0 0 1 3.16 4.74a4.26 4.26 0 0 0 1.32 5.7 4.2 4.2 0 0 1-1.93-.54v.05a4.27 4.27 0 0 0 3.42 4.18 4.3 4.3 0 0 1-1.92.07 4.27 4.27 0 0 0 3.99 2.97A8.57 8.57 0 0 1 2 19.54a12.07 12.07 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19-.01-.38-.02-.57A8.65 8.65 0 0 0 24 5.3a8.46 8.46 0 0 1-2.54.7z" />
                  </svg>
                </Link>
              </div>
            </div>
          </footer>
        </div>

        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  )
}

/* Tailwind starfield animation (add to globals.css)
----------------------------------------------------
.animate-starfield { animation: star-scroll 60s linear infinite; }
@keyframes star-scroll {
  from { background-position: 0 0; }
  to   { background-position: 10000px 5000px; }
}
*/
