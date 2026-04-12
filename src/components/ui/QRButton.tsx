"use client"

import { useState } from "react"
import Image from "next/image"

export function QRButton({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false)
  const qrUrl = `/api/qr?url=${encodeURIComponent(url)}`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="QR 코드 보기"
        className="shrink-0 px-3 py-2 border border-[#e4e2df] text-[#43474e] rounded-lg text-sm hover:bg-[#f5f3f0] transition-colors"
        aria-label="QR 코드"
      >
        <span className="material-symbols-outlined text-base leading-none">qr_code</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 mx-4 flex flex-col items-center gap-4">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-serif text-base font-semibold text-[#022448] text-center max-w-[240px] break-words">
              {title}
            </h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`${title} QR 코드`}
              width={240}
              height={240}
              className="rounded-lg"
            />
            <p className="text-xs text-[#74777f] text-center">
              QR 코드를 스캔하면 바로 이동합니다
            </p>
            <a
              href={qrUrl}
              download={`qr-${title}.png`}
              className="text-xs text-[#795900] underline underline-offset-4 hover:text-[#022448] transition-colors"
            >
              QR 이미지 저장
            </a>
          </div>
        </div>
      )}
    </>
  )
}
