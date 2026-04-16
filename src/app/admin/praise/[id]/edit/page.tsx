"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function EditPraisePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState("")
  const [serviceDate, setServiceDate] = useState("")
  const [musicalKey, setMusicalKey] = useState("")
  const [theme, setTheme] = useState("")
  const [season, setSeason] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchConti() {
      try {
        const res = await fetch(`/api/praise/${id}`)
        if (!res.ok) throw new Error("Failed to fetch conti")
        const data = await res.json()
        setTitle(data.title)
        setServiceDate(new Date(data.serviceDate).toISOString().split("T")[0])
        setMusicalKey(data.musicalKey || "")
        setTheme(data.theme || "")
        setSeason(data.season || "")
      } catch {
        setError("콘티 정보를 불러올 수 없습니다.")
      } finally {
        setLoading(false)
      }
    }
    fetchConti()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/praise/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, serviceDate, musicalKey, theme, season }),
      })

      if (!res.ok) throw new Error("Failed to update conti")
      router.push("/admin/praise")
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
      <h1 className="text-2xl font-bold mb-6">찬양 콘티 수정</h1>
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
          <Input
            id="musicalKey"
            label="코드 (선택)"
            value={musicalKey}
            onChange={(e) => setMusicalKey(e.target.value)}
            placeholder="예: C, D, G"
          />
          <Input
            id="theme"
            label="주제 (선택)"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="예: 은혜, 성령, 부흥"
          />
          <Input
            id="season"
            label="절기 (선택)"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="예: 성탄, 부활, 추수감사"
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              저장
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/praise")}
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
