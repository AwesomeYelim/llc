import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { AdminPrayerClient } from "@/components/admin/AdminPrayerClient"

export default async function AdminPrayerPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const prayers = await prisma.prayerRequest.findMany({
    orderBy: { createdAt: "desc" },
  })

  const serialized = prayers.map((p) => ({
    id: p.id,
    name: p.name,
    content: p.content,
    isAnonymous: p.isAnonymous,
    isAnswered: p.isAnswered,
    createdAt: p.createdAt.toISOString(),
  }))

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">기도 요청 관리</h1>
        <p className="text-gray-500 mt-1">총 {prayers.length}건의 기도 요청</p>
      </div>

      <AdminPrayerClient prayers={serialized} />
    </AdminLayout>
  )
}
