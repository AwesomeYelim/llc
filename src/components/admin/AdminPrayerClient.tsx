"use client"

interface Prayer {
  id: number
  name: string
  content: string
  isAnonymous: boolean
  createdAt: string
}

export function AdminPrayerClient({ prayers }: { prayers: Prayer[] }) {
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
        <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5">
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
