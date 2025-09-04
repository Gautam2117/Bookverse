import "@/styles/globals.css";
import { Inter, Spectral } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });
const spectral = Spectral({ subsets: ["latin"], weight: ["400","600","700"] });

export const metadata = {
  title: "BookVerse",
  description: "Read, download, and own beautiful books.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#0b0f1a] text-slate-200">
      <body className={`${inter.className} antialiased`}>        
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-b border-white/10">
            {/* import Navbar */}
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10">
            {/* import Footer */}
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}