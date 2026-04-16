import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import Link from "next/link"
import { formatDateShort } from "@/lib/utils"
import { DeleteButton } from "@/components/admin/DeleteButton"
import { Badge } from "@/components/ui/Badge"

export default async function AdminBulletinsPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const bulletins = await prisma.bulletin.findMany({
    include: { files: true },
    orderBy: { serviceDate: "desc" },
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">주보/PPT 관리</h1>
        <Link
          href="/admin/bulletins/new"
          className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73]"
        >
          + 업로드
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">제목</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">유형</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden sm:table-cell">파일수</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">날짜</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bulletins.map((bulletin) => (
              <tr key={bulletin.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{bulletin.title}</td>
                <td className="px-4 py-3">
                  <Badge variant={bulletin.bulletinType === "PPT" ? "warning" : "primary"}>
                    {bulletin.bulletinType === "PPT" ? "PPT" : "주보"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                  {bulletin.files.length}개
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(bulletin.serviceDate)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/bulletins/${bulletin.id}/edit`}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      수정
                    </Link>
                    <DeleteButton id={bulletin.id} endpoint="/api/bulletins" />
                  </div>
                </td>
              </tr>
            ))}
            {bulletins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  등록된 주보/PPT가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
