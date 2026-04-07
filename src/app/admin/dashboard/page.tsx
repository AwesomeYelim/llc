import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import Link from "next/link"
import { SyncButtons } from "@/components/admin/SyncButtons"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const [sermonCount, columnCount, praiseCount, bulletinCount, galleryCount] =
    await Promise.all([
      prisma.sermon.count(),
      prisma.column.count(),
      prisma.praiseConti.count(),
      prisma.bulletin.count(),
      prisma.galleryImage.count(),
    ])

  const stats = [
    { label: "설교 영상", count: sermonCount, href: "/admin/sermons", icon: "🎬" },
    { label: "설교 원고", count: columnCount, href: "/admin/columns", icon: "📝" },
    { label: "찬양 콘티", count: praiseCount, href: "/admin/praise", icon: "🎵" },
    { label: "주보/PPT", count: bulletinCount, href: "/admin/bulletins", icon: "📋" },
    { label: "갤러리", count: galleryCount, href: "/admin/gallery", icon: "🖼" },
  ]

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 mt-1">동남 생명의 빛 교회 관리자 페이지</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-[#1e3a5f] mt-1">{stat.count}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <SyncButtons />
      </div>

      <div className="mt-4 bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/sermons/new"
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73] transition-colors"
          >
            + 설교 등록
          </Link>
          <Link
            href="/admin/praise/new"
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73] transition-colors"
          >
            + 콘티 업로드
          </Link>
          <Link
            href="/admin/bulletins/new"
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73] transition-colors"
          >
            + 주보 업로드
          </Link>
          <Link
            href="/admin/columns/new"
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73] transition-colors"
          >
            + 설교 원고 작성
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}
