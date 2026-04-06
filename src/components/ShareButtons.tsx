"use client"

import { useState } from "react"

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKakaoShare = () => {
    const url = window.location.href
    window.open(
      `https://story.kakao.com/share?url=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400"
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">공유하기</span>
      <button
        onClick={handleKakaoShare}
        className="px-3 py-1.5 bg-[#FEE500] text-gray-900 rounded-lg text-sm font-medium hover:bg-[#FDD800]"
      >
        카카오톡
      </button>
      <button
        onClick={handleCopyLink}
        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
      >
        {copied ? "복사됨!" : "링크 복사"}
      </button>
    </div>
  )
}
