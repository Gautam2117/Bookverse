import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin.server'

const adminPaths = ['/admin']

export async function middleware(req: NextRequest) {
  if (!adminPaths.some(p => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = req.cookies.get('__session')?.value
  if (!token) return NextResponse.redirect(new URL('/auth', req.url))

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    if (decoded.role !== 'admin') throw new Error('Not an admin')
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/', req.url))
  }
}

export const config = { matcher: ['/admin/:path*'] }
