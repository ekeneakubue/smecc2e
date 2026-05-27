"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GuidelinesPdfViewerProps = {
  src: string;
  onScrolledToEnd: () => void;
};

export function GuidelinesPdfViewer({
  src,
  onScrolledToEnd,
}: GuidelinesPdfViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const pdf = await pdfjs.getDocument(src).promise;
        const images: string[] = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.35 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport, canvas }).promise;
          images.push(canvas.toDataURL("image/jpeg", 0.92));
        }

        if (!cancelled) {
          setPageImages(images);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load the guidelines PDF. Use download or open in browser below.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  const checkScrollEnd = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (atEnd) onScrolledToEnd();
  }, [onScrolledToEnd]);

  useEffect(() => {
    if (!loading && pageImages.length > 0) {
      checkScrollEnd();
    }
  }, [loading, pageImages.length, checkScrollEnd]);

  return (
    <div
      ref={scrollRef}
      onScroll={checkScrollEnd}
      className="max-h-[min(70vh,560px)] overflow-y-auto bg-slate-100"
    >
      {loading && (
        <p className="px-4 py-8 text-center text-sm font-medium text-slate-600">
          Loading guidelines…
        </p>
      )}
      {error && (
        <p className="px-4 py-6 text-center text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      {!loading &&
        pageImages.map((imageUrl, index) => (
          <img
            key={index}
            src={imageUrl}
            alt={`Application guidelines page ${index + 1}`}
            className="block w-full border-b border-slate-200 bg-white"
          />
        ))}
    </div>
  );
}
