import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import { getFirestore as getAdminDb } from "firebase-admin/firestore";

let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  adminApp = getApps()[0]!;
}

export const adminDb = getAdminDb(adminApp);
export const adminStorage = getAdminStorage(adminApp);