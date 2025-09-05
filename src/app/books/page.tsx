import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import { listBooks, storagePublicUrl } from "@/lib/books";

export const metadata = { title: "Catalog — BookVerse" };
export const revalidate = 60;

export default async function Catalog() {
  const books = await listBooks();

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">Catalog</h2>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
    </>
  );
}
