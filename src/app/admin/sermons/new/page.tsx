import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { SermonForm } from "@/components/admin/SermonForm"

export default async function NewSermonPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">새 설교 등록</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <SermonForm />
      </div>
    </AdminLayout>
  )
}
