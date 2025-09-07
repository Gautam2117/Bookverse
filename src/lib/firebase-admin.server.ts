/* server-only Firebase Admin helper — NOTE: no "use server" needed
   because the `.server.ts` suffix keeps it out of client bundles. */
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage }   from 'firebase-admin/storage'
import type { App }     from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId  : process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey : process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
} else {
  adminApp = getApps()[0]!
}

export const adminDb      = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)
export const adminAuth = getAuth(adminApp)
