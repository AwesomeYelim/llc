"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { RichTextEditor } from "./RichTextEditor"

interface ColumnFormProps {
  initial?: {
    id?: number
    title: string
    content: string
    scripture: string
    sermonId: string
    coverImageUrl: string
  }
  sermons: { id: number; title: string }[]
}

export function ColumnForm({ initial, sermons }: ColumnFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(initial?.title || "")
  const [content, setContent] = useState(initial?.content || "")
  const [scripture, setScripture] = useState(initial?.scripture || "")
  const [sermonId, setSermonId] = useState(initial?.sermonId || "")
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initial?.id ? `/api/columns/${initial.id}` : "/api/columns"
      const method = initial?.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, scripture, sermonId, coverImageUrl }),
      })

      if (res.ok) {
        router.push("/admin/columns")
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Input
          id="title"
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          id="scripture"
          label="성경 구절"
          value={scripture}
          onChange={(e) => setScripture(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sermonId" className="block text-sm font-medium text-gray-700 mb-1">
            연결 설교
          </label>
          <select
            id="sermonId"
            value={sermonId}
            onChange={(e) => setSermonId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white"
          >
            <option value="">선택 안 함</option>
            {sermons.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        <Input
          id="coverImageUrl"
          label="커버 이미지 URL"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading}>
          {initial?.id ? "수정하기" : "발행하기"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  )
}
