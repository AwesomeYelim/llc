import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import Link from "next/link"
import { formatDateShort, formatFileSize } from "@/lib/utils"
import { DeleteButton } from "@/components/admin/DeleteButton"

export default async function AdminPraisePage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const contis = await prisma.praiseConti.findMany({
    orderBy: { serviceDate: "desc" },
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">찬양 콘티 & 가사 PPT 관리</h1>
        <Link
          href="/admin/praise/new"
          className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73]"
        >
          + 콘티 업로드
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">제목</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden sm:table-cell">파일</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden md:table-cell">다운로드</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">날짜</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {contis.map((conti) => (
              <tr key={conti.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{conti.title}</td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                  {conti.fileName} ({formatFileSize(conti.fileSize)})
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{conti.downloadCount}회</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(conti.serviceDate)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/praise/${conti.id}/edit`}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      수정
                    </Link>
                    <DeleteButton id={conti.id} endpoint="/api/praise" />
                  </div>
                </td>
              </tr>
            ))}
            {contis.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  등록된 콘티가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
