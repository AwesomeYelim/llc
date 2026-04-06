import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import Link from "next/link"
import { formatDateShort, serviceTypeLabel } from "@/lib/utils"
import { DeleteButton } from "@/components/admin/DeleteButton"

export default async function AdminSermonsPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const sermons = await prisma.sermon.findMany({
    orderBy: { sermonDate: "desc" },
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">설교 관리</h1>
        <Link
          href="/admin/sermons/new"
          className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73]"
        >
          + 새 설교
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">제목</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden md:table-cell">성경</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden sm:table-cell">유형</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">날짜</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sermons.map((sermon) => (
              <tr key={sermon.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{sermon.title}</td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{sermon.scripture}</td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                  {serviceTypeLabel(sermon.serviceType)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(sermon.sermonDate)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/sermons/edit?id=${sermon.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      수정
                    </Link>
                    <DeleteButton id={sermon.id} endpoint="/api/sermons" />
                  </div>
                </td>
              </tr>
            ))}
            {sermons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  등록된 설교가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
