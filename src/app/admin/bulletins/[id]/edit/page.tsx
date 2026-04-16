"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function EditBulletinPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState("")
  const [serviceDate, setServiceDate] = useState("")
  const [bulletinType, setBulletinType] = useState("BULLETIN")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchBulletin() {
      try {
        const res = await fetch(`/api/bulletins/${id}`)
        if (!res.ok) throw new Error("Failed to fetch bulletin")
        const data = await res.json()
        setTitle(data.title)
        setServiceDate(new Date(data.serviceDate).toISOString().split("T")[0])
        setBulletinType(data.bulletinType)
      } catch {
        setError("주보 정보를 불러올 수 없습니다.")
      } finally {
        setLoading(false)
      }
    }
    fetchBulletin()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/bulletins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, serviceDate, bulletinType }),
      })

      if (!res.ok) throw new Error("Failed to update bulletin")
      router.push("/admin/bulletins")
    } catch {
      setError("수정에 실패했습니다.")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">불러오는 중...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">주보/PPT 수정</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            id="serviceDate"
            label="예배 날짜"
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            required
          />
          <div className="w-full">
            <label htmlFor="bulletinType" className="block text-sm font-medium text-gray-700 mb-1">
              유형
            </label>
            <select
              id="bulletinType"
              value={bulletinType}
              onChange={(e) => setBulletinType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors"
            >
              <option value="BULLETIN">주보</option>
              <option value="PPT">PPT</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              저장
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/bulletins")}
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
