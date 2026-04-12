"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CalendarEvent {
  id: number
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  isAllDay: boolean
  eventType: string
  eventTypeLabel: string
}

const EVENT_COLORS: Record<string, string> = {
  general: "bg-[#022448] text-white",
  special: "bg-[#795900] text-white",
  worship: "bg-[#1e3a5f] text-white",
  meeting: "bg-[#43474e] text-white",
}

export function CalendarView({
  events,
  year,
  month,
}: {
  events: CalendarEvent[]
  year: number
  month: number
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<CalendarEvent | null>(null)

  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const eventsByDay = events.reduce<Record<number, CalendarEvent[]>>((acc, e) => {
    const d = new Date(e.startDate).getDate()
    if (!acc[d]) acc[d] = []
    acc[d].push(e)
    return acc
  }, {})

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={`/calendar?year=${prevMonth.year}&month=${prevMonth.month}`}
          className="p-2 rounded-lg hover:bg-[#f5f3f0] transition-colors text-[#022448]"
          aria-label="이전 달"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </Link>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#022448]">
          {year}년 {month}월
        </h2>
        <Link
          href={`/calendar?year=${nextMonth.year}&month=${nextMonth.month}`}
          className="p-2 rounded-lg hover:bg-[#f5f3f0] transition-colors text-[#022448]"
          aria-label="다음 달"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-[#e4e2df] overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-[#e4e2df]">
          {weekdays.map((d, i) => (
            <div
              key={d}
              className={`py-3 text-center text-sm font-semibold ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-[#43474e]"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const isToday =
              day !== null &&
              new Date().getFullYear() === year &&
              new Date().getMonth() + 1 === month &&
              new Date().getDate() === day
            const dayEvents = day ? (eventsByDay[day] ?? []) : []
            const colIdx = idx % 7

            return (
              <div
                key={idx}
                className={`min-h-[80px] md:min-h-[100px] p-1.5 border-b border-r border-[#e4e2df] ${
                  !day ? "bg-[#fbf9f6]" : ""
                } ${colIdx === 6 ? "border-r-0" : ""}`}
              >
                {day && (
                  <>
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1 ${
                        isToday
                          ? "bg-[#795900] text-white"
                          : colIdx === 0
                          ? "text-red-500"
                          : colIdx === 6
                          ? "text-blue-500"
                          : "text-[#022448]"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setSelected(e)}
                          className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate ${
                            EVENT_COLORS[e.eventType] ?? "bg-gray-500 text-white"
                          }`}
                        >
                          {e.title}
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <button
                          onClick={() => setSelected(dayEvents[2])}
                          className="text-xs text-[#74777f] pl-1"
                        >
                          +{dayEvents.length - 2}개 더
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event list below */}
      {events.length > 0 && (
        <div className="mt-8">
          <h3 className="font-serif text-xl text-[#022448] mb-4">{month}월 전체 일정</h3>
          <div className="space-y-2">
            {events.map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#e4e2df] cursor-pointer hover:border-[#795900]/30 transition-colors"
                onClick={() => setSelected(e)}
              >
                <div
                  className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
                    EVENT_COLORS[e.eventType] ?? "bg-gray-500 text-white"
                  }`}
                >
                  {e.eventTypeLabel}
                </div>
                <div>
                  <p className="font-semibold text-[#022448]">{e.title}</p>
                  <p className="text-sm text-[#74777f] mt-0.5">
                    {new Date(e.startDate).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
                    {e.endDate &&
                      ` ~ ${new Date(e.endDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="mt-8 text-center py-16 text-[#43474e]">
          <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4 block">event_busy</span>
          이달의 등록된 일정이 없습니다.
        </div>
      )}

      {/* Event detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 ${
                EVENT_COLORS[selected.eventType] ?? "bg-gray-500 text-white"
              }`}
            >
              {selected.eventTypeLabel}
            </div>
            <h3 className="font-serif text-xl font-bold text-[#022448] mb-2">{selected.title}</h3>
            <p className="text-sm text-[#74777f] mb-4">
              {new Date(selected.startDate).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
              {selected.endDate &&
                ` ~ ${new Date(selected.endDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}`}
            </p>
            {selected.description && (
              <p className="text-[#43474e] text-sm leading-relaxed whitespace-pre-wrap">
                {selected.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
