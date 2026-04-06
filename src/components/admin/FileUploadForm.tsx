"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FileUpload } from "@/components/ui/FileUpload"

interface FileUploadFormProps {
  type: "praise" | "bulletin"
  bulletinType?: "BULLETIN" | "PPT"
}

export function FileUploadForm({ type, bulletinType }: FileUploadFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0])
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert("파일을 선택해주세요.")
    setLoading(true)

    try {
      // Upload file
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) throw new Error("Upload failed")

      if (type === "praise") {
        await fetch("/api/praise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            serviceDate,
            fileName: uploadData.fileName,
            fileUrl: uploadData.url,
            fileSize: uploadData.fileSize,
          }),
        })
      } else {
        await fetch("/api/bulletins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            serviceDate,
            bulletinType: bulletinType || "BULLETIN",
            files: [
              {
                fileName: uploadData.fileName,
                fileUrl: uploadData.url,
                fileSize: uploadData.fileSize,
              },
            ],
          }),
        })
      }

      router.push(type === "praise" ? "/admin/praise" : "/admin/bulletins")
      router.refresh()
    } catch {
      alert("업로드에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
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
      {type === "bulletin" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="bulletinType" value="BULLETIN" defaultChecked /> 주보
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="bulletinType" value="PPT" /> PPT
            </label>
          </div>
        </div>
      )}
      <FileUpload
        label="파일 업로드"
        accept=".pdf,.docx,.hwp,.pptx,.ppt"
        onFileSelect={setFile}
        maxSize={50 * 1024 * 1024}
      />
      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading}>
          업로드
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  )
}
