import Image from "next/image";
import Link from "next/link";

export type Book = {
  id: string; slug: string; title: string; author: string; cover: string;
  priceINR: number; isPremium: boolean; tags: string[];
};

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.slug}`} className="group">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0">
        <div className="aspect-[3/4] overflow-hidden">
          <Image src={book.cover} alt={book.title} width={600} height={800} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
        </div>
        <div className="p-4">
          <h3 className="font-semibold line-clamp-1">{book.title}</h3>
          <p className="text-sm text-slate-400 line-clamp-1">{book.author}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              {book.tags.slice(0,2).map(t => (
                <span key={t} className="text-[10px] uppercase tracking-wide rounded-full bg-violet-600/20 text-violet-300 px-2 py-0.5">{t}</span>
              ))}
            </div>
            <span className="text-sm font-semibold">
              {book.isPremium ? `₹${book.priceINR}` : "Free"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}