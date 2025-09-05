// src/app/books/[slug]/page.tsx
// @ts-nocheck

import Image from "next/image";
import Link from "next/link";
import { getBookBySlug, storagePublicUrl } from "@/lib/books";

export const revalidate = 60;

export default async function BookDetail({ params }) {
  const slug = (await params)?.slug ?? params?.slug; // works whether it's a Promise or plain
  const book = await getBookBySlug(slug);
  if (!book) return <div className="mx-auto max-w-6xl px-4 py-10">Book not found.</div>;

  const cover = book.coverPath ? storagePublicUrl(book.coverPath) : "/placeholder-cover.jpg";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="rounded-2xl overflow-hidden border border-white/10">
        <Image src={cover} alt={book.title} width={900} height={1200} className="w-full h-auto"/>
      </div>
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">{book.title}</h1>
        <p className="mt-1 text-slate-400">by {book.author}</p>
        <div className="mt-4 flex gap-2">
          {(book.tags ?? []).map((t) => (
            <span key={t} className="text-[10px] uppercase tracking-wide rounded-full bg-violet-600/20 text-violet-300 px-2 py-0.5">{t}</span>
          ))}
        </div>
        <p className="mt-5 text-slate-300 leading-relaxed">{book.description}</p>
        <div className="mt-6 flex items-center gap-4">
          <span className="text-2xl font-bold">{book.isPremium ? `₹${book.priceINR}` : "Free"}</span>

          {/* Free → read now; Premium → (placeholder) checkout route */}
          <Link
            href={book.isPremium ? `/checkout/${book.slug}` : `/reader/${book.slug}`}
            className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold hover:bg-violet-500"
          >
            {book.isPremium ? "Buy now" : "Read now"}
          </Link>

          {/* Always allow a preview */}
          <Link
            href={`/reader/${book.slug}`}
            className="rounded-xl border border-white/10 px-5 py-2.5 hover:bg-white/5"
          >
            Preview
          </Link>
        </div>
      </div>
    </div>
  );
}
