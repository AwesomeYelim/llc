import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import { CalendarView } from "@/components/calendar/CalendarView"
import { EVENT_TYPE_LABELS } from "@/lib/constants"

export const metadata: Metadata = generatePageMetadata(
  "교회 일정",
  "동남 생명의 빛 교회 월간 일정표입니다.",
  "/calendar"
)

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const year = Number(params.year || now.getFullYear())
  const month = Number(params.month || now.getMonth() + 1)

  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59)

  const events = await prisma.event.findMany({
    where: { startDate: { gte: start, lte: end } },
    orderBy: { startDate: "asc" },
  })

  const serialized = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate?.toISOString() ?? null,
    isAllDay: e.isAllDay,
    eventType: e.eventType,
    eventTypeLabel: EVENT_TYPE_LABELS[e.eventType] ?? e.eventType,
  }))

  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-24">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-[1px] bg-[#795900]" />
          <span className="text-sm uppercase tracking-[0.2em] text-[#795900] font-semibold">
            교회 일정
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#022448] mb-4">
          월간 일정표
        </h1>
        <p className="text-[#43474e] text-lg">
          이달의 예배 일정 및 교회 행사를 확인하세요.
        </p>
      </div>

      <CalendarView events={serialized} year={year} month={month} />
    </div>
  )
}
