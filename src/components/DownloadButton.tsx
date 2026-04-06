"use client"

interface DownloadButtonProps {
  fileUrl: string
  fileName: string
  id: number
  endpoint: string
}

export function DownloadButton({ fileUrl, fileName, id, endpoint }: DownloadButtonProps) {
  const handleDownload = async () => {
    // Track download
    fetch(`${endpoint}/${id}`, { method: "GET" }).catch(() => {})

    // Trigger download
    const a = document.createElement("a")
    a.href = fileUrl
    a.download = fileName
    a.click()
  }

  return (
    <button
      onClick={handleDownload}
      className="shrink-0 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73] transition-colors"
    >
      다운로드
    </button>
  )
}
