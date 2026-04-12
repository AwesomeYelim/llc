"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FileUpload } from "@/components/ui/FileUpload"
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
  const [imageUploading, setImageUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCoverImageUrl(data.url)
    } catch {
      alert("이미지 업로드에 실패했습니다.")
    } finally {
      setImageUploading(false)
    }
  }

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">커버 이미지</label>
          <FileUpload
            label="이미지 업로드"
            accept="image/*"
            onFileSelect={handleImageUpload}
          />
          {imageUploading && (
            <p className="text-xs text-gray-500 mt-1">업로드 중...</p>
          )}
          {coverImageUrl && !imageUploading && (
            <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
              <Image src={coverImageUrl} alt="커버 이미지 미리보기" fill className="object-cover" />
            </div>
          )}
        </div>
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
