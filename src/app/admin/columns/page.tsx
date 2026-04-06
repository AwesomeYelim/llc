import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import Link from "next/link"
import { formatDateShort } from "@/lib/utils"
import { DeleteButton } from "@/components/admin/DeleteButton"

export default async function AdminColumnsPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const columns = await prisma.column.findMany({
    orderBy: { createdAt: "desc" },
    include: { sermon: { select: { title: true } } },
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">설교 원고 관리</h1>
        <Link
          href="/admin/columns/new"
          className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73]"
        >
          + 새 원고
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">제목</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden md:table-cell">성경</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden sm:table-cell">연결 설교</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">작성일</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {columns.map((col) => (
              <tr key={col.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{col.title}</td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{col.scripture || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                  {col.sermon?.title || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(col.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/columns/edit?id=${col.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      수정
                    </Link>
                    <DeleteButton id={col.id} endpoint="/api/columns" />
                  </div>
                </td>
              </tr>
            ))}
            {columns.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  등록된 원고가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
