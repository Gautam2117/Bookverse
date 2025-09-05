// scripts/importBooks.ts
import "dotenv/config";
import fg from "fast-glob";
import * as path from "path";
import slugify from "slugify";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// ============ CONFIG ============
const PDF_DIR = path.join(process.cwd(), "seed", "books");    // local PDFs
const COVER_DIR = path.join(process.cwd(), "seed", "covers"); // local covers
const BUCKET_FOLDER_PDF = "books";     // destination folder in Storage
const BUCKET_FOLDER_COVER = "covers";  // destination folder in Storage

const DEFAULT_AUTHOR = "Gautam Govind";
const DEFAULT_PRICE_INR = 0;           // set >0 for premium

const FORCE_REUPLOAD_PDF = false;      // true = always overwrite Storage PDF
const FORCE_SET_COVER = false;         // true = overwrite existing Firestore coverPath
// =================================

// Service account creds from env
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

initializeApp({
  credential: cert(serviceAccount as any),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // e.g. <project>.appspot.com or <project>.firebasestorage.app
});
const db = getFirestore();
const bucket = getStorage().bucket();

function titleize(basename: string) {
  return basename.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function contentTypeForExt(ext: string) {
  const e = ext.toLowerCase();
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".png") return "image/png";
  if (e === ".pdf") return "application/pdf";
  return undefined;
}

async function storageObjectExists(gcsPath: string) {
  const file = bucket.file(gcsPath);
  const [exists] = await file.exists();
  return exists;
}

async function uploadIfNeeded(localPath: string, destPath: string, force = false) {
  if (!force && (await storageObjectExists(destPath))) {
    console.log(`↷ Skipping upload (already exists): gs://${bucket.name}/${destPath}`);
    return;
  }
  await bucket.upload(localPath, {
    destination: destPath,
    contentType: contentTypeForExt(path.extname(localPath)),
    resumable: true,
  });
  console.log(`✓ Uploaded → gs://${bucket.name}/${destPath}`);
}

/**
 * IMPORTANT: fast-glob needs POSIX-style patterns.
 * We search with { cwd: COVER_DIR } and simple names,
 * then join back to an absolute path.
 */
async function findLocalCover(slug: string, pdfBase: string) {
  const candidates = [
    `${slug}.jpg`,
    `${slug}.png`,
    `${pdfBase}.jpg`,
    `${pdfBase}.png`,
  ];

  for (const name of candidates) {
    // search inside COVER_DIR, case-insensitive
    const matches = await fg(name, { cwd: COVER_DIR, onlyFiles: true, caseSensitiveMatch: false });
    if (matches.length) {
      // matches[0] is relative to COVER_DIR; convert to absolute
      return path.join(COVER_DIR, matches[0]);
    }
  }
  return null;
}

(async () => {
  // Debug: list what we see in covers (helps catch path issues)
  const debugCovers = await fg("*.{jpg,jpeg,png}", { cwd: COVER_DIR, onlyFiles: true, caseSensitiveMatch: false });
  console.log(`Found ${debugCovers.length} cover file(s) in seed/covers:`);
  debugCovers.slice(0, 20).forEach((f) => console.log(" •", f));
  if (debugCovers.length > 20) console.log(" • …");

  const pdfFiles = await fg("*.pdf", { cwd: PDF_DIR, onlyFiles: true });
  if (!pdfFiles.length) {
    console.log("No PDFs found in seed/books/");
    process.exit(0);
  }

  for (const pdfFile of pdfFiles) {
    const localPdfPath = path.join(PDF_DIR, pdfFile);

    const pdfBase = path.basename(pdfFile, path.extname(pdfFile)); // e.g. "Starlight-Hostel"
    const title = titleize(pdfBase);
    const slug = slugify(title, { lower: true, strict: true });    // e.g. "starlight-hostel"

    // Upload PDF (idempotent unless forced)
    const storagePdfPath = `${BUCKET_FOLDER_PDF}/${pdfFile}`;
    console.log(`Uploading ${pdfFile} → gs://${bucket.name}/${storagePdfPath}`);
    await uploadIfNeeded(localPdfPath, storagePdfPath, FORCE_REUPLOAD_PDF);

    // Cover: try local file, upload to covers/<slug>.<ext>
    let coverPath: string | null = null;
    const localCover = await findLocalCover(slug, pdfBase);
    if (localCover) {
      const ext = path.extname(localCover).toLowerCase();
      const dest = `${BUCKET_FOLDER_COVER}/${slug}${ext}`;
      await bucket.upload(localCover, {
        destination: dest,
        contentType: contentTypeForExt(ext),
        resumable: true,
      });
      console.log(`✓ Uploaded cover → ${dest}`);
      coverPath = dest;
    } else {
      console.warn(`No local cover found for ${slug} (${pdfBase}), leaving coverPath unchanged if already set.`);
    }

    // Firestore upsert (preserve existing coverPath unless forced)
    const docRef = db.doc(`books/${slug}`);
    const snap = await docRef.get();
    const existing = snap.exists ? (snap.data() as any) : null;

    const coverPathToWrite =
      coverPath ?? (FORCE_SET_COVER ? null : existing?.coverPath ?? null);

    await docRef.set(
      {
        title,
        slug,
        author: existing?.author ?? DEFAULT_AUTHOR,
        description: existing?.description ?? "",
        priceINR: existing?.priceINR ?? DEFAULT_PRICE_INR,
        isPremium: existing?.isPremium ?? DEFAULT_PRICE_INR > 0,
        coverPath: coverPathToWrite,
        filePathPdf: storagePdfPath,
        samplePathPdf: existing?.samplePathPdf ?? null,
        tags: existing?.tags ?? [],
        pages: existing?.pages ?? null,
        createdAt: existing?.createdAt ?? new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(`✓ Firestore doc upserted for ${slug}`);
  }

  console.log("All done!");
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
