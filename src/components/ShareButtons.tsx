"use client"

import { useState } from "react"

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const [kakaoFallback, setKakaoFallback] = useState(false)

  const handleKakaoShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href })
      } catch {
        // AbortError: 사용자 취소 — 무시
      }
    } else {
      // 데스크톱 폴백: 클립보드 복사
      await navigator.clipboard.writeText(window.location.href)
      setKakaoFallback(true)
      setTimeout(() => setKakaoFallback(false), 2000)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">공유하기</span>
      <button
        onClick={handleKakaoShare}
        className="px-3 py-1.5 bg-[#FEE500] text-gray-900 rounded-lg text-sm font-medium hover:bg-[#FDD800] transition-colors"
      >
        {kakaoFallback ? "링크 복사됨!" : "카카오톡"}
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
