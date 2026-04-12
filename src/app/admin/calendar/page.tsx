import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import Link from "next/link"
import { AdminCalendarClient } from "@/components/admin/AdminCalendarClient"

export default async function AdminCalendarPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const events = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    take: 50,
  })

  const serialized = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate?.toISOString() ?? null,
    isAllDay: e.isAllDay,
    eventType: e.eventType,
  }))

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">교회 일정 관리</h1>
          <p className="text-gray-500 mt-1">일정을 등록하고 관리하세요.</p>
        </div>
        <Link
          href="/admin/calendar/new"
          className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73] transition-colors"
        >
          + 일정 등록
        </Link>
      </div>

      <AdminCalendarClient events={serialized} />
    </AdminLayout>
  )
}
