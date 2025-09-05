import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { listBooks, storagePublicUrl } from "@/lib/books";

export const revalidate = 60; // ISR

export default async function Home() {
  const books = await listBooks(3);

  return (
    <>
      <Navbar />
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-violet-300 text-xs uppercase tracking-[0.3em]">New • Curated • Beautiful</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-bold leading-tight">
              Stories that feel like <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">home</span>.
            </h1>
            <p className="mt-4 text-slate-300 max-w-xl">
              Read and own gorgeously crafted ebooks. Free picks for everyone, premium editions for collectors.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/books" className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold hover:bg-violet-500">Browse books</Link>
              <a href="#featured" className="rounded-xl border border-white/10 px-5 py-2.5 hover:bg-white/5">Featured</a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {books.map((b) => (
              <BookCard
                key={b.id}
                book={{
                  id: b.id,
                  slug: b.slug,
                  title: b.title,
                  author: b.author,
                  cover: b.coverPath ? storagePublicUrl(b.coverPath) : "/placeholder-cover.jpg",
                  priceINR: b.priceINR,
                  isPremium: b.isPremium,
                  tags: b.tags ?? [],
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
