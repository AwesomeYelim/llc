"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input, Textarea } from "@/components/ui/Input"
import { extractYoutubeId } from "@/lib/utils"

interface SermonFormProps {
  initial?: {
    id?: number
    title: string
    scripture: string
    sermonDate: string
    serviceType: string
    youtubeUrl: string
    blogUrl: string
    summary: string
    series: string
    tags: string
  }
}

export function SermonForm({ initial }: SermonFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: initial?.title || "",
    scripture: initial?.scripture || "",
    sermonDate: initial?.sermonDate || new Date().toISOString().split("T")[0],
    serviceType: initial?.serviceType || "SUNDAY_MAIN",
    youtubeUrl: initial?.youtubeUrl || "",
    blogUrl: initial?.blogUrl || "",
    summary: initial?.summary || "",
    series: initial?.series || "",
    tags: initial?.tags || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const youtubeId = extractYoutubeId(form.youtubeUrl)
    const body = { ...form, youtubeId }

    try {
      const url = initial?.id ? `/api/sermons/${initial.id}` : "/api/sermons"
      const method = initial?.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push("/admin/sermons")
        router.refresh()
      } else {
        alert("저장에 실패했습니다.")
      }
    } catch {
      alert("오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <Input
        id="title"
        label="설교 제목"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        required
      />
      <Input
        id="scripture"
        label="성경 구절"
        value={form.scripture}
        onChange={(e) => update("scripture", e.target.value)}
        placeholder="예: 요한복음 3:16"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="sermonDate"
          label="설교 날짜"
          type="date"
          value={form.sermonDate}
          onChange={(e) => update("sermonDate", e.target.value)}
          required
        />
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
            예배 유형
          </label>
          <select
            id="serviceType"
            value={form.serviceType}
            onChange={(e) => update("serviceType", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
          >
            <option value="SUNDAY_MAIN">주일예배</option>
            <option value="SUNDAY_SCHOOL">주일학교</option>
            <option value="WEDNESDAY">수요예배</option>
            <option value="FRIDAY">금요예배</option>
            <option value="SPECIAL">특별예배</option>
          </select>
        </div>
      </div>
      <Input
        id="youtubeUrl"
        label="유튜브 URL"
        value={form.youtubeUrl}
        onChange={(e) => update("youtubeUrl", e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
      />
      <Input
        id="blogUrl"
        label="블로그 URL"
        value={form.blogUrl}
        onChange={(e) => update("blogUrl", e.target.value)}
        placeholder="https://blog.naver.com/..."
      />
      <Textarea
        id="summary"
        label="설교 요약"
        value={form.summary}
        onChange={(e) => update("summary", e.target.value)}
        rows={4}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="series"
          label="시리즈"
          value={form.series}
          onChange={(e) => update("series", e.target.value)}
          placeholder="예: 믿음 시리즈"
        />
        <Input
          id="tags"
          label="태그 (쉼표 구분)"
          value={form.tags}
          onChange={(e) => update("tags", e.target.value)}
          placeholder="믿음,기도,은혜"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading}>
          {initial?.id ? "수정하기" : "등록하기"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  )
}
