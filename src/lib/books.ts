import { adminDb } from "@/lib/firebase-admin";

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!; // e.g. bookverse-6355d.appspot.com

export type BookDoc = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverPath: string | null;        // e.g. "covers/starlight-hostel.jpg"
  filePathPdf: string;             // e.g. "books/Starlight-Hostel.pdf"
  priceINR: number;
  isPremium: boolean;
  tags?: string[];
  description?: string;
};

export function storagePublicUrl(objectPath: string) {
  // objectPath like "covers/starlight-hostel.png"
  const object = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${object}?alt=media`;
}

export async function listBooks(limit?: number): Promise<BookDoc[]> {
  let q = adminDb.collection("books").orderBy("createdAt", "desc");
  if (limit) q = q.limit(limit) as any;
  const snap = await q.get();

  return snap.docs.map((d) => {
    const x = d.data() as any;
    return {
      id: d.id,
      slug: x.slug ?? d.id,
      title: x.title,
      author: x.author ?? "Unknown",
      coverPath: x.coverPath ?? null,
      filePathPdf: x.filePathPdf,
      priceINR: x.priceINR ?? 0,
      isPremium: !!x.isPremium,
      tags: x.tags ?? [],
      description: x.description ?? "",
    };
  });
}

export async function getBookBySlug(slug: string): Promise<BookDoc | null> {
  const doc = await adminDb.doc(`books/${slug}`).get();
  if (!doc.exists) return null;
  const x = doc.data() as any;
  return {
    id: doc.id,
    slug: x.slug ?? doc.id,
    title: x.title,
    author: x.author ?? "Unknown",
    coverPath: x.coverPath ?? null,
    filePathPdf: x.filePathPdf,
    priceINR: x.priceINR ?? 0,
    isPremium: !!x.isPremium,
    tags: x.tags ?? [],
    description: x.description ?? "",
  };
}
