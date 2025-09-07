'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  User as FbUser,
  onAuthStateChanged,
  signOut as fbSignOut,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type FirestoreError,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase-client'

/* ────────────────────────── types ────────────────────────── */
type Role = 'user' | 'admin'

export type Profile = {
  email: string
  displayName: string | null
  role: Role
  createdAt: any // serverTimestamp
}

type Ctx = {
  user: FbUser | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

/* ──────────────────────── context ───────────────────────── */
const Ctx = createContext<Ctx | undefined>(undefined)

/* ─────────────────────── provider ───────────────────────── */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<FbUser | null>(null)
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    /* keep a reference so we can clean up the onSnapshot later */
    let unsubProfile: (() => void) | undefined

    /** ensure there is a users/{uid} doc (if not, create one) */
    const ensureProfile = async (u: FbUser) => {
      const ref  = doc(db, 'users', u.uid)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        await setDoc(ref, {
          email: u.email,
          displayName: u.displayName ?? null,
          role: 'user',
          createdAt: serverTimestamp(),
        })
      }

      /* start realtime listener */
      unsubProfile = onSnapshot(
        ref,
        (s) => {
          setProfile(s.data() as Profile)
          setLoading(false)
        },
        (err: FirestoreError) => {
          console.error('[AuthProvider] profile listener error', err)
          setLoading(false)
        },
      )
    }

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      /* remove previous profile listener (if any) */
      unsubProfile?.()
      setProfile(null)

      if (!u) {
        setUser(null)
        setLoading(false)
        return
      }

      setUser(u)
      setLoading(true)
      await ensureProfile(u)
    })

    /* cleanup on unmount */
    return () => {
      unsubAuth()
      unsubProfile?.()
    }
  }, [])

  return (
    <Ctx.Provider
      value={{
        user,
        profile,
        loading,
        signOut: () => fbSignOut(auth),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

/* ──────────────────────── hook ──────────────────────────── */
export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
