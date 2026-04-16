"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EVENT_TYPE_LABELS } from "@/lib/constants"

interface AdminEvent {
  id: number
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  isAllDay: boolean
  eventType: string
}

export function AdminCalendarClient({ events }: { events: AdminEvent[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<number | null>(null)

  async function handleDelete(id: number) {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return
    setDeleting(id)
    await fetch(`/api/events/${id}`, { method: "DELETE" })
    setDeleting(null)
    router.refresh()
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
        등록된 일정이 없습니다.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">날짜</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">제목</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">구분</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-gray-700">
                {new Date(e.startDate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="px-6 py-4 font-medium text-gray-900">{e.title}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {EVENT_TYPE_LABELS[e.eventType] ?? e.eventType}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handleDelete(e.id)}
                  disabled={deleting === e.id}
                  className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40"
                >
                  {deleting === e.id ? "삭제 중..." : "삭제"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
