"use client";
import { useEffect, useRef, useState } from "react";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist/types/src/display/api";

export default function Reader({
  params,
}: {
  params: { bookId: string };   // ← inline type only
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const { getDocument, GlobalWorkerOptions, version } = await import(
        "pdfjs-dist"
      );
      GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

      const url = `/api/download?bookId=${params.bookId}&uid=DEMO`;
      const pdf: PDFDocumentProxy = await getDocument(url).promise;

      const p: PDFPageProxy = await pdf.getPage(page);
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
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded border px-3 py-1"
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="rounded border px-3 py-1"
        >
          Next
        </button>
      </div>
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
    </div>
  );
}
