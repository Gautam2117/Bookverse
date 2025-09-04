"use client";
import { useEffect, useRef, useState } from "react";
// Use legacy build for better bundler compatibility
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

export default function Reader({ params }: { params: { bookId: string } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const url = `/api/download?bookId=${params.bookId}&uid=DEMO`; // replace with real uid
      const pdf = await (pdfjsLib as any).getDocument(url).promise;
      const p = await pdf.getPage(page);
      const viewport = p.getViewport({ scale: 1.4 });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await p.render({ canvasContext: ctx, viewport }).promise;
    })();
  }, [page, params.bookId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded border px-3 py-1">Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} className="rounded border px-3 py-1">Next</button>
      </div>
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
    </div>
  );
}
