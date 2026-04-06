"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/utils"

interface FileUploadProps {
  accept?: string
  maxSize?: number // bytes
  onFileSelect: (file: File) => void
  label?: string
  className?: string
}

export function FileUpload({ accept, maxSize, onFileSelect, label, className }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      if (maxSize && file.size > maxSize) {
        setError(`파일 크기가 ${formatFileSize(maxSize)}를 초과합니다.`)
        return
      }
      setSelectedFile(file)
      onFileSelect(file)
    },
    [maxSize, onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragOver ? "border-[#1e3a5f] bg-[#1e3a5f]/5" : "border-gray-300 hover:border-gray-400"
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
        {selectedFile ? (
          <div className="text-sm">
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-gray-500">{formatFileSize(selectedFile.size)}</p>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <p className="mb-1">파일을 드래그하거나 클릭하여 업로드</p>
            {accept && <p className="text-xs text-gray-400">허용 형식: {accept}</p>}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
