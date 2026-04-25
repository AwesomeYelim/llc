"use client"

import { useState } from "react"

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href })
      } catch {
        // AbortError: 사용자 취소 — 무시
      }
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleShare}
        className="px-3 py-1.5 bg-[#022448] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f] transition-colors"
      >
        공유하기
      </button>
      <button
        onClick={handleCopyLink}
        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
      >
        {copied ? "복사됨!" : "링크 복사"}
      </button>
    </div>
  )
}
