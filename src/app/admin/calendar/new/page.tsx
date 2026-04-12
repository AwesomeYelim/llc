import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { NewEventForm } from "@/components/admin/NewEventForm"

export default async function NewEventPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 일정 등록</h1>
      </div>
      <div className="max-w-xl">
        <NewEventForm />
      </div>
    </AdminLayout>
  )
}
