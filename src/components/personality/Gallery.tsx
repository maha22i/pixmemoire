"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface GalleryProps {
  urls: string[];
  alt: string;
}

export function Gallery({ urls, alt }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  if (!urls.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {urls.map((url, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-gris-bordure/80 cursor-pointer"
          >
            <Image
              src={url}
              alt={`${alt} - ${index + 1}`}
              fill
              className="grayscale-photo object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-noir/90 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
            aria-label="Fermer"
          >
            <X className="h-8 w-8" />
          </button>

          <div
            className="relative max-h-[85vh] max-w-[85vw] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urls[lightboxIndex]}
              alt={`${alt} - ${lightboxIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
