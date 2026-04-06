import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { ColumnForm } from "@/components/admin/ColumnForm"

export default async function EditColumnPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const { id } = await searchParams
  if (!id) redirect("/admin/columns")

  const [column, sermons] = await Promise.all([
    prisma.column.findUnique({ where: { id: parseInt(id) } }),
    prisma.sermon.findMany({
      select: { id: true, title: true },
      orderBy: { sermonDate: "desc" },
      take: 50,
    }),
  ])

  if (!column) redirect("/admin/columns")

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">설교 원고 수정</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <ColumnForm
          initial={{
            id: column.id,
            title: column.title,
            content: column.content,
            scripture: column.scripture || "",
            sermonId: column.sermonId?.toString() || "",
            coverImageUrl: column.coverImageUrl || "",
          }}
          sermons={sermons}
        />
      </div>
    </AdminLayout>
  )
}
