import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { SermonForm } from "@/components/admin/SermonForm"

export default async function EditSermonPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const { id } = await searchParams
  if (!id) redirect("/admin/sermons")

  const sermon = await prisma.sermon.findUnique({
    where: { id: parseInt(id) },
  })

  if (!sermon) redirect("/admin/sermons")

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">설교 수정</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <SermonForm
          initial={{
            id: sermon.id,
            title: sermon.title,
            scripture: sermon.scripture,
            sermonDate: sermon.sermonDate.toISOString().split("T")[0],
            serviceType: sermon.serviceType,
            youtubeUrl: sermon.youtubeUrl || "",
            blogUrl: sermon.blogUrl || "",
            summary: sermon.summary || "",
            series: sermon.series || "",
            tags: sermon.tags || "",
          }}
        />
      </div>
    </AdminLayout>
  )
}
