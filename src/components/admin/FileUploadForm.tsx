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

export function FileUploadForm({ type, bulletinType: defaultBulletinType }: FileUploadFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0])
  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [selectedBulletinType, setSelectedBulletinType] = useState(defaultBulletinType || "BULLETIN")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (type === "praise" && !file) return alert("파일을 선택해주세요.")
    if (type === "bulletin" && files.length === 0 && !file) return alert("파일을 선택해주세요.")

    setLoading(true)

    try {
      if (type === "praise") {
        // 단일 파일 업로드
        const formData = new FormData()
        formData.append("file", file!)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error("Upload failed")

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
        // 주보/PPT: 여러 파일 동시 업로드
        const filesToUpload = files.length > 0 ? files : file ? [file] : []
        const uploadedFiles = []

        for (const f of filesToUpload) {
          const formData = new FormData()
          formData.append("file", f)
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
          const uploadData = await uploadRes.json()
          if (!uploadRes.ok) throw new Error(`Upload failed: ${f.name}`)
          uploadedFiles.push({
            fileName: uploadData.fileName,
            fileUrl: uploadData.url,
            fileSize: uploadData.fileSize,
          })
        }

        await fetch("/api/bulletins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            serviceDate,
            bulletinType: selectedBulletinType,
            files: uploadedFiles,
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
              <input
                type="radio"
                name="bulletinType"
                value="BULLETIN"
                checked={selectedBulletinType === "BULLETIN"}
                onChange={() => setSelectedBulletinType("BULLETIN")}
              />
              주보
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="bulletinType"
                value="PPT"
                checked={selectedBulletinType === "PPT"}
                onChange={() => setSelectedBulletinType("PPT")}
              />
              PPT
            </label>
          </div>
        </div>
      )}
      <FileUpload
        label={type === "bulletin" ? "파일 업로드 (여러 파일 가능)" : "파일 업로드"}
        accept=".pdf,.docx,.hwp,.pptx,.ppt,.jpg,.png"
        onFileSelect={setFile}
        onFilesSelect={type === "bulletin" ? setFiles : undefined}
        multiple={type === "bulletin"}
        maxSize={50 * 1024 * 1024}
      />
      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading}>
          {loading ? "업로드 중..." : "업로드"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  )
}
