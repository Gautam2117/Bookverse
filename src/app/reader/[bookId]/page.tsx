"use client";
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

export default function Reader({ params }: { params: { bookId: string } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const url = `/api/download?bookId=${params.bookId}&uid=DEMO`; // replace with real uid
      const pdf = await pdfjsLib.getDocument(url).promise;
      const p = await pdf.getPage(page);
      const viewport = p.getViewport({ scale: 1.4 });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await p.render({ canvasContext: ctx, canvas, viewport }).promise;
    })();
  }, [page, params.bookId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setPage(p => Math.max(1, p-1))} className="rounded border px-3 py-1">Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p+1)} className="rounded border px-3 py-1">Next</button>
      </div>
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
    </div>
  );
}