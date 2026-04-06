import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { ColumnForm } from "@/components/admin/ColumnForm"

export default async function NewColumnPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const sermons = await prisma.sermon.findMany({
    select: { id: true, title: true },
    orderBy: { sermonDate: "desc" },
    take: 50,
  })

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">새 설교 원고</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <ColumnForm sermons={sermons} />
      </div>
    </AdminLayout>
  )
}
