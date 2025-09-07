/** Build a public URL for a Cloud Storage object — safe on client & server */
export function storagePublicUrl(objectPath: string) {
  const bucket  = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!
  const encoded = encodeURIComponent(objectPath)
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media`
}
