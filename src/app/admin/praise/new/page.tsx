import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { FileUploadForm } from "@/components/admin/FileUploadForm"

export default async function NewPraisePage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">찬양 콘티 업로드</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <FileUploadForm type="praise" />
      </div>
    </AdminLayout>
  )
}
