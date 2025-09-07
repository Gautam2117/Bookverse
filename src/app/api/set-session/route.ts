import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin.server'

export async function POST(req: NextRequest) {
  const { idToken } = await req.json?.() ?? {}
  if (!idToken) return NextResponse.json({ error:'idToken required' },{ status:400 })

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true)

    /* cookie settings */
    const opts = {
      httpOnly : true,
      secure   : process.env.NODE_ENV === 'production',
      sameSite : 'lax' as const,
      path     : '/',
      expires  : new Date(decoded.exp * 1000),   // same expiry as the token
    }

    const res = NextResponse.json({ ok:true })

    /* both cookies that the server expects */
    res.cookies.set('__session'    , idToken     , opts)  // full token
    res.cookies.set('__session_uid', decoded.uid , opts)  // just uid

    return res
  } catch {
    return NextResponse.json({ error:'invalid token' },{ status:401 })
  }
}
