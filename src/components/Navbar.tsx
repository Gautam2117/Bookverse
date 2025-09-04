"use client";
import Link from "next/link";
import { BookOpen, Library, ShoppingBag } from "lucide-react";

export default function Navbar() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
      <Link href="/" className="group inline-flex items-center gap-2">
        <BookOpen className="h-6 w-6" />
        <span className="font-semibold tracking-wide">BookVerse</span>
        <span className="ml-2 text-xs rounded-full bg-violet-600/20 text-violet-300 px-2 py-0.5 group-hover:bg-violet-600/30">beta</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm text-slate-300">
        <Link href="/books" className="hover:text-white">Catalog</Link>
        <Link href="/library" className="hover:text-white inline-flex items-center gap-2"><Library className="h-4 w-4"/>Library</Link>
        <Link href="/auth" className="hover:text-white">Sign in</Link>
        <Link href="/#" className="ml-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10">
          <ShoppingBag className="h-4 w-4"/> Store
        </Link>
      </nav>
    </div>
  );
}