"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

interface GalleryImage {
  id: number
  imageUrl: string
  title: string | null
}

export function GalleryLightbox({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const close = useCallback(() => setActiveIndex(null), [])
  const prev = useCallback(() =>
    setActiveIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null)),
    [images.length]
  )
  const next = useCallback(() =>
    setActiveIndex((i) => (i !== null ? (i + 1) % images.length : null)),
    [images.length]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeIndex === null) return
      if (e.key === "Escape") close()
      else if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [activeIndex, close, prev, next])

  useEffect(() => {
    document.body.style.overflow = activeIndex !== null ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [activeIndex])

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(idx)}
            className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[#795900]"
          >
            <Image
              src={img.imageUrl}
              alt={img.title || "교회 사진"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity text-3xl drop-shadow-lg">
                zoom_in
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          <button
            onClick={prev}
            className="absolute left-4 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="이전"
          >
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>

          {/* Image */}
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-16 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={images[activeIndex].imageUrl}
                alt={images[activeIndex].title || "교회 사진"}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 90vw, 1200px"
                priority
              />
            </div>
          </div>

          {/* Next */}
          <button
            onClick={next}
            className="absolute right-4 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="다음"
          >
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>

          {/* Title */}
          {images[activeIndex].title && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-4 py-2 rounded-full">
              {images[activeIndex].title}
            </div>
          )}

          {/* Backdrop click */}
          <div className="absolute inset-0 -z-10" onClick={close} />
        </div>
      )}
    </>
  )
}
