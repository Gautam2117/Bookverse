import Navbar from "@/components/Navbar";
import BookCard, { Book } from "@/components/BookCard";

const mock: Book[] = [
  { id:"1", slug:"starlight-hostel", title:"Starlight Hostel", author:"A. Sharma", cover:"/covers/starlight.jpg", priceINR:0, isPremium:false, tags:["magical","9–12"] },
  { id:"2", slug:"byte-warriors", title:"Byte Warriors: The Lost Password", author:"R. Mehta", cover:"/covers/byte.jpg", priceINR:79, isPremium:true, tags:["cyber","9–12"] },
  { id:"3", slug:"forest-of-whispers", title:"Forest of Whispers", author:"I. Rao", cover:"/covers/forest.jpg", priceINR:99, isPremium:true, tags:["fantasy","YA"] },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-violet-300 text-xs uppercase tracking-[0.3em]">New • Curated • Beautiful</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-bold leading-tight">Stories that feel like <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">home</span>.</h1>
            <p className="mt-4 text-slate-300 max-w-xl">Read and own gorgeously crafted ebooks. Free picks for everyone, premium editions for collectors.</p>
            <div className="mt-6 flex gap-3">
              <a href="/books" className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold hover:bg-violet-500">Browse books</a>
              <a href="#featured" className="rounded-xl border border-white/10 px-5 py-2.5 hover:bg-white/5">Featured</a>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {mock.map(b => <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      </section>
    </>
  );
}