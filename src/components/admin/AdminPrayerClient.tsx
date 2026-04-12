"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Prayer {
  id: number
  name: string
  content: string
  isAnonymous: boolean
  isAnswered: boolean
  createdAt: string
}

export function AdminPrayerClient({ prayers }: { prayers: Prayer[] }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<number | null>(null)

  async function toggleAnswered(prayer: Prayer) {
    setUpdating(prayer.id)
    await fetch("/api/prayer", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prayer.id, isAnswered: !prayer.isAnswered }),
    })
    setUpdating(null)
    router.refresh()
  }

  if (prayers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
        접수된 기도 요청이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {prayers.map((p) => (
        <div
          key={p.id}
          className={`bg-white rounded-xl border p-5 transition-colors ${
            p.isAnswered ? "border-green-100 bg-green-50/30" : "border-gray-100"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-800">
                  {p.isAnonymous ? "익명" : p.name}
                </span>
                {p.isAnonymous && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">익명</span>
                )}
                {p.isAnswered && (
                  <span className="text-xs text-green-700 bg-green-100 px-1.5 py-0.5 rounded">응답됨</span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{p.content}</p>
            </div>
            <button
              onClick={() => toggleAnswered(p)}
              disabled={updating === p.id}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                p.isAnswered
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {updating === p.id ? "..." : p.isAnswered ? "응답 취소" : "응답 처리"}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
