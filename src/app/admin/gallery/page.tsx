"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FileUpload } from "@/components/ui/FileUpload"
import Image from "next/image"

interface GalleryImage {
  id: number
  imageUrl: string
  title: string | null
  category: string | null
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then(setImages)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}))
        throw new Error(err.error || `업로드 API 오류 (${uploadRes.status})`)
      }
      const uploadData = await uploadRes.json()

      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadData.url,
          title: title || null,
          category: category || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `갤러리 저장 오류 (${res.status})`)
      }
      const newImage = await res.json()
      setImages((prev) => [...prev, newImage])
      setTitle("")
      setCategory("")
      setFile(null)
    } catch (e) {
      alert(`업로드 실패: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return
    await fetch(`/api/gallery/${id}`, { method: "DELETE" })
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">갤러리 관리</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">사진 업로드</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            id="title"
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            id="category"
            label="카테고리"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="예: 예배, 행사, 교회"
          />
          <FileUpload
            label="이미지"
            accept="image/*"
            onFileSelect={setFile}
          />
        </div>
        <Button onClick={handleUpload} loading={loading} className="mt-4">
          업로드
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative group bg-white rounded-lg overflow-hidden border">
            <div className="relative aspect-square">
              <Image
                src={img.imageUrl}
                alt={img.title || "갤러리 이미지"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="p-2">
              <p className="text-sm font-medium truncate">{img.title || "제목 없음"}</p>
              {img.category && (
                <p className="text-xs text-gray-400">{img.category}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
