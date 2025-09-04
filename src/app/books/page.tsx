import BookCard, { Book } from "@/components/BookCard";

const mock: Book[] = [
  // repeat or fetch from Firestore later
];

export default function Catalog() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">Catalog</h2>
        {/* add filters/search */}
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {mock.map(b => <BookCard key={b.id} book={b} />)}
      </div>
    </div>
  );
}