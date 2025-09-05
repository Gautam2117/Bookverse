// src/app/reader/[slug]/page.tsx
// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/types/src/display/api";

export default function Reader() {
  const { slug } = useParams<{ slug: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { getDocument, GlobalWorkerOptions, version } = await import("pdfjs-dist");
      GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

      const url = `/api/preview?slug=${encodeURIComponent(slug)}`;
      const pdf: PDFDocumentProxy = await getDocument(url).promise;

      if (cancelled) return;
      setPageCount(pdf.numPages);

      const p: PDFPageProxy = await pdf.getPage(page);
      const viewport = p.getViewport({ scale: 1.35 });

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await p.render({ canvasContext: ctx, viewport }).promise;
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, page]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded border border-white/10 px-3 py-1 hover:bg-white/5"
        >
          Prev
        </button>
        <span className="text-sm text-slate-300">
          Page {page}{pageCount ? ` / ${pageCount}` : ""}
        </span>
        <button
          onClick={() => setPage((p) => (pageCount ? Math.min(pageCount, p + 1) : p + 1))}
          className="rounded border border-white/10 px-3 py-1 hover:bg-white/5"
        >
          Next
        </button>
      </div>
      <canvas ref={canvasRef} className="rounded-lg shadow-lg bg-black/10" />
    </div>
  );
}
