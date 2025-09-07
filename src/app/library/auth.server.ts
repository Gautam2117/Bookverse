// src/lib/auth.server.ts
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase-admin.server'
import type { UserRecord } from 'firebase-admin/auth'

export async function getServerUser(): Promise<UserRecord | null> {
  const cookieStore = await cookies()                // ← await here
  const token = cookieStore.get('__session')?.value
  if (!token) return null

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    return await adminAuth.getUser(decoded.uid)
  } catch {
    return null
  }
}
