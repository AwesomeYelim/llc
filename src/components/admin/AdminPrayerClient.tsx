"use client"

import { useState } from "react"

interface Prayer {
  id: number
  name: string
  content: string
  isAnonymous: boolean
  createdAt: string
}

export function AdminPrayerClient({ prayers }: { prayers: Prayer[] }) {
  const [list, setList] = useState(prayers)

  async function deletePrayer(id: number) {
    if (!confirm("이 기도 요청을 삭제하시겠습니까?")) return
    await fetch(`/api/prayer?id=${id}`, { method: "DELETE" })
    setList((prev) => prev.filter((p) => p.id !== id))
  }

  if (list.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
        접수된 기도 요청이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {list.map((p) => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 relative">
          <button
            onClick={() => deletePrayer(p.id)}
            className="absolute top-3 right-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-colors"
            title="삭제"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-800">
              {p.isAnonymous ? "익명" : p.name}
            </span>
            {p.isAnonymous && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">익명</span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(p.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{p.content}</p>
        </div>
      ))}
    </div>
  )
}
