import "dotenv/config";
import fg from "fast-glob";
import fs from "fs/promises";
import path from "path";
import slugify from "slugify";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// ---------- config ----------
const PDF_DIR = path.join(process.cwd(), "seed", "books"); // PDFs here
const COVER_DIR = path.join(process.cwd(), "seed", "covers"); // optional jpgs
const BUCKET_PATH = "books"; // storage folder
const PRICE_PER_BOOK = 0;    // set >0 later for premium
// -----------------------------

// service account creds from env
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

initializeApp({ credential: cert(serviceAccount as any), storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET });
const db = getFirestore();
const bucket = getStorage().bucket();

(async () => {
  const pdfFiles = await fg("*.pdf", { cwd: PDF_DIR });
  const AUTHOR = "Gautam Govind";

  for (const file of pdfFiles) {
    const filePath = path.join(PDF_DIR, file);
    const title = file
      .replace(/[-_]/g, " ")
      .replace(/\.pdf$/i, "")
      .replace(/\b\w/g, (m) => m.toUpperCase()); // simple titleise
    const slug = slugify(title, { lower: true, strict: true });        // e.g. "starlight-hostel"
    const storagePdfPath = `${BUCKET_PATH}/${file}`;

    console.log(`Uploading ${file} → gs://${bucket.name}/${storagePdfPath}`);
    await bucket.upload(filePath, { destination: storagePdfPath });

    // OPTIONAL: if you already have cover JPEGs, copy them up too
    const coverFile = `${slug}.jpg`;
    let coverPath: string | null = null;
    try {
      await fs.access(path.join(COVER_DIR, coverFile));
      coverPath = `covers/${coverFile}`;
      await bucket.upload(path.join(COVER_DIR, coverFile), { destination: coverPath });
    } catch {
      console.warn(`No cover found for ${slug}, skipping.`);
    }

    // Firestore doc
    await db.doc(`books/${slug}`).set(
      {
        title,
        slug,
        author: AUTHOR,
        description: "",
        priceINR: PRICE_PER_BOOK,
        isPremium: PRICE_PER_BOOK > 0,
        coverPath,
        filePathPdf: storagePdfPath,
        samplePathPdf: null,
        tags: [],
        pages: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true },
    );

    console.log(`✓ Firestore doc for ${slug}`);
  }

  console.log("All done!");
  process.exit(0);
})();
