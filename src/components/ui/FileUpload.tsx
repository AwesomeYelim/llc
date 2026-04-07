"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/utils"

interface FileUploadProps {
  accept?: string
  maxSize?: number // bytes
  onFileSelect: (file: File) => void
  onFilesSelect?: (files: File[]) => void
  multiple?: boolean
  label?: string
  className?: string
}

export function FileUpload({
  accept,
  maxSize,
  onFileSelect,
  onFilesSelect,
  multiple,
  label,
  className,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null)
      const fileArray = Array.from(files)
      const valid: File[] = []

      for (const file of fileArray) {
        if (maxSize && file.size > maxSize) {
          setError(`${file.name}: 파일 크기가 ${formatFileSize(maxSize)}를 초과합니다.`)
          continue
        }
        valid.push(file)
      }

      if (valid.length === 0) return

      if (multiple && onFilesSelect) {
        setSelectedFiles(valid)
        onFilesSelect(valid)
      } else {
        setSelectedFiles([valid[0]])
        onFileSelect(valid[0])
      }
    },
    [maxSize, onFileSelect, onFilesSelect, multiple]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(updated)
    if (multiple && onFilesSelect) {
      onFilesSelect(updated)
    } else if (updated.length > 0) {
      onFileSelect(updated[0])
    }
  }

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
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
          }}
        />
        {selectedFiles.length > 0 ? (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            {selectedFiles.map((file, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                <div>
                  <span className="font-medium text-gray-900">{file.name}</span>
                  <span className="text-gray-400 ml-2">{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-red-400 hover:text-red-600 text-xs ml-2"
                >
                  삭제
                </button>
              </div>
            ))}
            <p className="text-xs text-gray-400 pt-1">클릭하여 추가하거나 파일을 드래그</p>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <span className="material-symbols-outlined text-3xl text-gray-300 mb-2 block">upload_file</span>
            <p className="mb-1">
              {multiple ? "파일들을 드래그하거나 클릭하여 업로드" : "파일을 드래그하거나 클릭하여 업로드"}
            </p>
            {accept && <p className="text-xs text-gray-400">허용 형식: {accept}</p>}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
